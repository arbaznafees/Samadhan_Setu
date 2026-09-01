import re
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.services.gemini_service import _client, _IS_KEY_CONFIGURED
from app.models.entities import Report, User, AuditLog
from app.celery_tasks import triage_and_process_report_task, process_report_pipeline_sync

logger = logging.getLogger(__name__)

TRACKING_NUMBER_RE = re.compile(r"JH-2026-\d{4}", re.IGNORECASE)

# ==================== SITE MAP (used for navigation guidance + system prompt) ====================
# (keywords, path, label, description) — used for both live-Gemini context and the simulated fallback.
SITE_MAP = [
    (["file a", "submit a", "report an issue", "new grievance", "new report", "raise an issue"],
     "/citizen/report", "Report an Issue",
     "the page to file a new grievance with photos/location"),
    (["track", "status of my", "check my report"],
     "/citizen", "Citizen Home",
     "the citizen home page — you can also just give me a tracking number here in chat"),
    (["my reports", "my grievances", "reports i filed"],
     "/citizen", "Citizen Home",
     "the citizen home page, where your submitted reports are listed if you're logged in"),
    (["hei portal", "university", "institution portal", "faculty", "researcher"],
     "/hei", "HEI Portal",
     "the portal for university/institution reviewers to see assigned reports and submit research proposals"),
    (["industry portal", "csr", "funding portal", "corporate", "sponsor"],
     "/industry", "Industry Portal",
     "the portal for industry CSR partners to browse proposals and pledge funding"),
    (["govt", "government dashboard", "analytics", "admin dashboard"],
     "/govt", "Govt Dashboard",
     "the government administrator dashboard with live analytics, duplicate inspection, and HEI overrides"),
    (["login", "sign in", "log in"],
     "/auth/login", "Login",
     "the login page"),
    (["register", "sign up", "create an account", "create account"],
     "/auth/register", "Register",
     "the account registration page"),
    (["home page", "homepage", "main page"],
     "/", "Home",
     "the Samadhan Setu Jharkhand home page"),
]

# ==================== UNIVERSAL SYSTEM PROMPT ====================
# The assistant is the same everywhere on the site — it does not restrict its own actions by
# which page it happens to be opened from, since anyone (citizen, faculty, CSR partner, admin,
# or a first-time visitor) may want to file/track a grievance or just find their way around.

BASE_SYSTEM_PROMPT = """
You are "Setu Sahayak", the site-wide help assistant for Samadhan Setu Jharkhand — a Government of Jharkhand
platform that routes citizen grievances to Higher Education Institutions (BIT Mesra, IIT ISM Dhanbad, NIT
Jamshedpur, Birsa Agricultural University, AIIMS Deoghar, Kolhan University) for research-backed solutions,
which are then funded by industry CSR partners (e.g. Tata Steel Foundation), with government oversight.

You are available on every page of the site to every visitor, regardless of their role. You can:
1. File a new grievance for anyone — use the submit_grievance tool once you have a clear title, a detailed
   description, and the district. Ask for any missing piece one at a time. Do not invent details.
2. Track any existing grievance for anyone — use the track_grievance tool if given a tracking number
   (format JH-2026-XXXX). No login is required to track.
3. List a logged-in citizen's own past reports — use list_my_reports (only works if they're logged in).
4. Give site-navigation guidance — tell people where to find things on the site (e.g. where to log in, where
   the HEI/Industry/Govt portals are, where to file or check a report) and point them to the right page.
5. Explain how the platform works for any role: citizens (report -> AI triage -> HEI research -> CSR funding ->
   resolution), HEI reviewers (auto-matched reports -> form a team -> submit a proposal), industry partners
   (browse proposals -> pledge CSR funding), and government admins (analytics, duplicate inspection, HEI override).

Known pages on the site:
- /citizen — citizen home (submitted reports, tracking)
- /citizen/report — file a new grievance
- /hei — HEI reviewer portal
- /industry — industry/CSR partner portal
- /govt — government analytics dashboard
- /auth/login and /auth/register — login/signup

When pointing someone to a page, mention it in the form [Label](/path) so it can be shown as a clickable link,
e.g. "You can do that on the [Report an Issue](/citizen/report) page."

Be warm, concise, and use plain language. Reply in the same language the person writes in (English or
Hindi/Hinglish).
"""

FAQ_SNIPPETS = [
    (["what is", "about samadhan", "how does this work", "what is this platform"],
     "Samadhan Setu Jharkhand lets you report a civic issue (like a broken handpump or a pothole). "
     "Our AI reads it, matches it to the right university for a proper solution, and then connects that "
     "solution to a company willing to fund it through CSR. You can track progress the whole way with your "
     "tracking number."),
    (["how long", "how much time", "resolve", "timeline"],
     "Timelines vary by issue, but you'll always be able to see the current status — Submitted, Triaged, "
     "HEI Assigned, Proposal Submitted, Industry Offered, In Progress, or Resolved — using your tracking number."),
    (["duplicate"],
     "If your issue looks very similar to one already reported nearby, we'll flag it as a possible duplicate "
     "so effort isn't wasted — but it's still tracked under your own tracking number."),
    (["match", "assign", "why was this assigned", "matching"],
     "Reports are matched to an institution using a transparent scoring rule: up to 60% for specialization "
     "overlap, up to 25% for geographic proximity (Haversine distance), and up to 15% for current workload — "
     "institutions with fewer active projects get priority."),
    (["proposal", "team", "hei submit"],
     "HEI reviewers open an assigned report on [HEI Portal](/hei), click Form Proposal, add their team (PI, "
     "Co-PI, students), and fill in methodology, budget, duration, and deliverables."),
    (["pledge", "fund", "csr"],
     "Industry partners open any proposal on [Industry Portal](/industry) and use the funding action to pledge "
     "a CSR grant, mentorship, equipment support, or joint R&D funding."),
    (["override", "reassign"],
     "Government admins can use the HEI Override tool on a report's detail view (on the "
     "[Govt Dashboard](/govt)) to manually reassign it, with a reason logged to the audit trail."),
    (["analytics", "dashboard numbers"],
     "All analytics on the [Govt Dashboard](/govt) are computed live from the database — resolution rate, "
     "domain/district breakdowns, and total CSR funding pledged."),
]

GENERIC_HELP = (
    "I can help you file a new grievance, track an existing one (just give me your tracking number, e.g. "
    "JH-2026-1234), or point you to the right place on the site. What would you like to do?"
)


# ==================== TOOL IMPLEMENTATIONS (shared by live + simulated paths) ====================

def _generate_tracking_number(db: Session) -> str:
    import random
    num = f"JH-2026-{random.randint(1000, 9999)}"
    while db.query(Report).filter(Report.tracking_number == num).first():
        num = f"JH-2026-{random.randint(1000, 9999)}"
    return num


def _tool_submit_grievance(db: Session, current_user: Optional[User], title: str, description: str,
                            district: Optional[str] = None) -> Dict[str, Any]:
    tracking_num = _generate_tracking_number(db)
    report = Report(
        tracking_number=tracking_num,
        citizen_id=current_user.id if current_user else None,
        citizen_name=current_user.full_name if current_user else "Anonymous Citizen (via chat)",
        citizen_phone=current_user.phone if current_user else None,
        title=title.strip()[:300],
        description=description.strip(),
        raw_text=f"{title}\n{description}",
        district=(district or "Ranchi").strip(),
        status="Submitted",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    db.add(AuditLog(
        report_id=report.id,
        action="REPORT_SUBMITTED_VIA_CHAT",
        actor_name=report.citizen_name,
        actor_role="citizen",
        details={"tracking_number": tracking_num, "district": report.district},
    ))
    db.commit()

    try:
        triage_and_process_report_task.delay(report.id)
    except Exception as e:
        logger.warning(f"Celery dispatch failed from chatbot ({e}), running triage pipeline synchronously.")
        process_report_pipeline_sync(report.id)

    db.refresh(report)
    return {
        "tracking_number": report.tracking_number,
        "status": report.status,
        "domain": report.domain,
        "priority": report.priority,
        "assigned_hei_id": report.assigned_hei_id,
    }


def _tool_track_grievance(db: Session, tracking_number: str) -> Dict[str, Any]:
    clean = tracking_number.strip().upper()
    report = db.query(Report).filter(Report.tracking_number == clean).first()
    if not report:
        return {"found": False, "tracking_number": clean}
    return {
        "found": True,
        "tracking_number": report.tracking_number,
        "title": report.title,
        "status": report.status,
        "domain": report.domain,
        "priority": report.priority,
        "is_duplicate": report.is_duplicate,
        "assigned_hei_id": report.assigned_hei_id,
        "hei_match_score": report.hei_match_score,
    }


def _tool_list_my_reports(db: Session, current_user: Optional[User]) -> Dict[str, Any]:
    if not current_user:
        return {"logged_in": False, "reports": []}
    reports = (
        db.query(Report)
        .filter(Report.citizen_id == current_user.id)
        .order_by(Report.created_at.desc())
        .limit(10)
        .all()
    )
    return {
        "logged_in": True,
        "reports": [
            {"tracking_number": r.tracking_number, "title": r.title, "status": r.status}
            for r in reports
        ],
    }


# ==================== SIMULATED (no Gemini key) FALLBACK ====================

_SUBMIT_TRIGGERS = ["file", "report an issue", "submit", "complaint", "new grievance", "register a problem",
                     "i want to report", "raise an issue"]
_NAV_TRIGGERS = ["where is", "where can i find", "where do i", "how do i get to", "which page", "how do i find",
                  "navigate"]
_STEP1_MARK = "short title for the issue"
_STEP2_MARK = "describe the issue in more detail"
_STEP3_MARK = "which district"


def _last_assistant_message(messages: List[Dict[str, str]]) -> Optional[str]:
    for m in reversed(messages[:-1]):
        if m.get("role") == "model":
            return m.get("content", "")
    return None


def _match_site_map(lower_msg: str) -> Optional[str]:
    for keywords, path, label, description in SITE_MAP:
        if any(k in lower_msg for k in keywords):
            return f"That's [{label}]({path}) — {description}."
    return None


def _simulate_chat(db: Session, messages: List[Dict[str, str]], portal: str,
                    current_user: Optional[User]) -> Dict[str, Any]:
    user_msg = messages[-1]["content"].strip()
    last_bot_msg = _last_assistant_message(messages) or ""
    lower_msg = user_msg.lower()

    # --- Mid-flow: continuing a grievance-filing wizard (available on any page, to anyone) ---
    if _STEP3_MARK in last_bot_msg.lower():
        user_turns = [m["content"] for m in messages if m["role"] == "user"]
        title = user_turns[-3] if len(user_turns) >= 3 else "Citizen-reported issue"
        description = user_turns[-2] if len(user_turns) >= 2 else user_turns[-1]
        district = user_msg
        result = _tool_submit_grievance(db, current_user, title, description, district)
        reply = (
            f"✅ Filed! Your tracking number is **{result['tracking_number']}**. "
            f"It's been classified under **{result['domain']}** with **{result['priority']}** priority"
            + (f" and routed to an institution for review." if result.get("assigned_hei_id") else ".")
            + " Save this number to track progress anytime, from anywhere on the site."
        )
        return {"reply": reply, "actions": [{"type": "report_submitted", "data": result}], "is_simulated": True}

    if _STEP2_MARK in last_bot_msg.lower():
        reply = "Which district is this in? (e.g. Ranchi, Dhanbad, Khunti, Jamshedpur)"
        return {"reply": reply, "actions": [], "is_simulated": True}

    if _STEP1_MARK in last_bot_msg.lower():
        reply = "Got it. Can you describe the issue in more detail — what's happening and where exactly?"
        return {"reply": reply, "actions": [], "is_simulated": True}

    # --- Track by tracking number, anywhere in the message, open to anyone ---
    match = TRACKING_NUMBER_RE.search(user_msg)
    if match:
        result = _tool_track_grievance(db, match.group(0))
        if not result["found"]:
            reply = f"I couldn't find a report with tracking number {match.group(0).upper()}. Please double-check it."
        else:
            reply = (
                f"**{result['title']}** (`{result['tracking_number']}`) is currently **{result['status']}** "
                f"— domain: {result['domain']}, priority: {result['priority']}."
                + (" ⚠️ This was flagged as a possible duplicate of an existing report." if result["is_duplicate"] else "")
            )
        return {"reply": reply, "actions": [{"type": "report_status", "data": result}], "is_simulated": True}

    if "track" in lower_msg or "status" in lower_msg:
        reply = "Sure — what's your tracking number? It looks like JH-2026-XXXX."
        return {"reply": reply, "actions": [], "is_simulated": True}

    if "my reports" in lower_msg or "my grievances" in lower_msg:
        result = _tool_list_my_reports(db, current_user)
        if not result["logged_in"]:
            reply = "Please [log in](/auth/login) to view your submitted reports, or give me a tracking number to check one directly."
        elif not result["reports"]:
            reply = "You haven't filed any reports yet. Want to file one now?"
        else:
            lines = "\n".join(f"- `{r['tracking_number']}` — {r['title']} ({r['status']})" for r in result["reports"])
            reply = f"Here are your recent reports:\n{lines}"
        return {"reply": reply, "actions": [{"type": "report_list", "data": result}], "is_simulated": True}

    if any(t in lower_msg for t in _SUBMIT_TRIGGERS):
        reply = "Sure, I can help you file a grievance. What's a short title for the issue?"
        return {"reply": reply, "actions": [], "is_simulated": True}

    # --- Site navigation guidance ---
    if any(t in lower_msg for t in _NAV_TRIGGERS):
        nav_answer = _match_site_map(lower_msg)
        if nav_answer:
            return {"reply": nav_answer, "actions": [], "is_simulated": True}

    # --- FAQ keyword matching ---
    for keywords, answer in FAQ_SNIPPETS:
        if any(k in lower_msg for k in keywords):
            return {"reply": answer, "actions": [], "is_simulated": True}

    # --- Fall back to a general site-map match even without a "where is" trigger word ---
    nav_answer = _match_site_map(lower_msg)
    if nav_answer:
        return {"reply": nav_answer, "actions": [], "is_simulated": True}

    return {"reply": GENERIC_HELP, "actions": [], "is_simulated": True}


# ==================== LIVE GEMINI (function-calling agent) ====================

def _build_tools():
    from google.genai import types
    declarations = [
        types.FunctionDeclaration(
            name="submit_grievance",
            description="File a new citizen grievance once you have a clear title, a detailed description, and "
                        "the district. Ask for any missing piece before calling this. Anyone on any page may ask "
                        "for this, not just logged-in citizens.",
            parameters={
                "type": "OBJECT",
                "properties": {
                    "title": {"type": "STRING", "description": "Short title of the issue"},
                    "description": {"type": "STRING", "description": "Full detailed description of the issue"},
                    "district": {"type": "STRING", "description": "Jharkhand district where the issue is located"},
                },
                "required": ["title", "description"],
            },
        ),
        types.FunctionDeclaration(
            name="track_grievance",
            description="Look up the current status of a previously filed grievance by its tracking number "
                        "(format JH-2026-XXXX). No login required — anyone can track any report.",
            parameters={
                "type": "OBJECT",
                "properties": {"tracking_number": {"type": "STRING"}},
                "required": ["tracking_number"],
            },
        ),
        types.FunctionDeclaration(
            name="list_my_reports",
            description="List all grievances filed by the currently logged-in citizen. Only works if the person "
                        "is logged in.",
            parameters={"type": "OBJECT", "properties": {}},
        ),
    ]
    return [types.Tool(function_declarations=declarations)]


def _execute_tool_call(db: Session, current_user: Optional[User], name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    if name == "submit_grievance":
        return _tool_submit_grievance(db, current_user, args.get("title", ""), args.get("description", ""),
                                       args.get("district"))
    if name == "track_grievance":
        return _tool_track_grievance(db, args.get("tracking_number", ""))
    if name == "list_my_reports":
        return _tool_list_my_reports(db, current_user)
    return {"error": f"Unknown tool {name}"}


def _live_chat(db: Session, messages: List[Dict[str, str]], portal: str,
                current_user: Optional[User]) -> Dict[str, Any]:
    from google.genai import types

    model_name = settings.GEMINI_MODEL or "gemini-3.5-flash-lite"
    system_instruction = BASE_SYSTEM_PROMPT + f"\n\nThe person is currently viewing the '{portal}' area of the site (this is just context — your capabilities are the same everywhere)."
    tools = _build_tools()

    contents = [
        types.Content(role=("model" if m["role"] == "model" else "user"), parts=[types.Part(text=m["content"])])
        for m in messages
    ]

    config = types.GenerateContentConfig(system_instruction=system_instruction, tools=tools)
    response = _client.models.generate_content(model=model_name, contents=contents, config=config)

    actions: List[Dict[str, Any]] = []
    candidate_parts = response.candidates[0].content.parts if response.candidates else []
    function_calls = [p.function_call for p in candidate_parts if getattr(p, "function_call", None)]

    if function_calls:
        follow_up_parts = []
        for fc in function_calls:
            args = dict(fc.args) if fc.args else {}
            result = _execute_tool_call(db, current_user, fc.name, args)
            actions.append({"type": fc.name, "data": result})
            follow_up_parts.append(
                types.Part.from_function_response(name=fc.name, response={"result": result})
            )
        contents.append(response.candidates[0].content)
        contents.append(types.Content(role="user", parts=follow_up_parts))
        final_response = _client.models.generate_content(model=model_name, contents=contents, config=config)
        reply_text = final_response.text
    else:
        reply_text = response.text

    return {"reply": reply_text, "actions": actions, "is_simulated": False}


# ==================== PUBLIC ENTRY POINT ====================

def handle_chat_message(db: Session, messages: List[Dict[str, str]], portal: str,
                         current_user: Optional[User]) -> Dict[str, Any]:
    """
    Main entry point used by the chatbot router. The assistant is universal: the same
    file/track/navigate/FAQ capabilities are available to anyone, from any page. `portal`
    is passed through only as light context (e.g. for the greeting), never as a restriction.

    messages: list of {"role": "user"|"model", "content": str}, oldest first.
    portal: "citizen" | "hei" | "industry" | "govt"
    """
    if not _IS_KEY_CONFIGURED or _client is None:
        return _simulate_chat(db, messages, portal, current_user)

    try:
        return _live_chat(db, messages, portal, current_user)
    except Exception as e:
        logger.warning(f"Live Gemini chat failed ({e}), falling back to simulated chat.")
        return _simulate_chat(db, messages, portal, current_user)
