from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.auth.dependencies import get_optional_current_user
from app.database import get_db
from app.models.entities import User, Report, HEI, Proposal, IndustryOffer
from app.services.gemini_service import chat_with_role

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str
    role_context: str


def build_live_db_context(db: Session, current_user: Optional[User], user_message: str) -> str:
    """
    Fetches real-time, role-specific data from the database.
    If the user is a guest (not logged in), strictly returns general platform info
    and prevents any exposure of private user data or records.
    """
    if not current_user:
        return """
USER SESSION: GUEST (NOT LOGGED IN)
- Role: Guest Visitor
- Note: This user is not logged in. DO NOT expose or invent any private user records, personal phone numbers, or private grievances.
- If the user asks about their personal complaint status (e.g. 'Where is my complaint?', 'Show my reports'), politely explain that they must log in to view their private tracking and dashboard.
- You CAN answer all general questions about Samadhan Setu features, how to report issues, departments, Jharkhand civic topics, and help drafting general complaint letters.
"""

    role = (current_user.role or "citizen").lower()
    context_lines = []

    # Common user profile context
    context_lines.append(f"CURRENT LOGGED-IN USER:")
    context_lines.append(f"- Name: {current_user.full_name}")
    context_lines.append(f"- Email: {current_user.email}")
    context_lines.append(f"- Role: {current_user.role}")
    context_lines.append(f"- District: {current_user.district or 'Ranchi'}")
    if current_user.organization:
        context_lines.append(f"- Organization: {current_user.organization}")

    try:
        if role == "citizen":
            # Fetch reports filed by this citizen
            user_reports = db.query(Report).filter(
                (Report.citizen_id == current_user.id) | (Report.citizen_phone == current_user.phone)
            ).order_by(Report.created_at.desc()).limit(10).all()

            if user_reports:
                context_lines.append(f"\nCITIZEN'S FILED GRIEVANCES ({len(user_reports)} recent):")
                for r in user_reports:
                    hei_name = r.assigned_hei.institute_name if r.assigned_hei else "Not yet assigned"
                    context_lines.append(
                        f"• Tracking #{r.tracking_number} | Title: '{r.title}' | Status: {r.status} | "
                        f"Priority: {r.priority} | Domain: {r.domain} | District: {r.district} | Assigned HEI: {hei_name} | "
                        f"Filed on: {r.created_at.strftime('%d-%b-%Y') if r.created_at else 'N/A'}"
                    )
            else:
                context_lines.append("\nCITIZEN'S FILED GRIEVANCES: No grievances filed yet by this user.")

            # If user asks about a tracking number or search query, look it up
            words = user_message.replace("#", " ").split()
            for w in words:
                if "SS-" in w.upper() or "JH-" in w.upper() or len(w) >= 6:
                    match = db.query(Report).filter(Report.tracking_number.ilike(f"%{w.strip()}%")).first()
                    if match:
                        hei_name = match.assigned_hei.institute_name if match.assigned_hei else "None"
                        context_lines.append(
                            f"\nSPECIFIC REPORT SEARCH MATCH:\n"
                            f"Tracking #{match.tracking_number} | Title: {match.title} | Status: {match.status} | "
                            f"Description: {match.description[:250]}... | Domain: {match.domain} | District: {match.district} | "
                            f"Assigned HEI: {hei_name} | AI Summary: {match.ai_summary or 'N/A'}"
                        )
                        break

        elif role == "govt_admin":
            # Aggregate system statistics
            total_reports = db.query(func.count(Report.id)).scalar() or 0
            resolved_reports = db.query(func.count(Report.id)).filter(Report.status == "Resolved").scalar() or 0
            pending_reports = db.query(func.count(Report.id)).filter(Report.status.in_(["Submitted", "Triaged", "HEI_Assigned"])).scalar() or 0
            critical_reports = db.query(func.count(Report.id)).filter(Report.priority == "Critical").scalar() or 0

            # Domain breakdown
            domain_counts = db.query(Report.domain, func.count(Report.id)).group_by(Report.domain).all()
            domain_summary = ", ".join([f"{d}: {c}" for d, c in domain_counts if d])

            # District breakdown (top 5)
            district_counts = db.query(Report.district, func.count(Report.id)).group_by(Report.district).order_by(func.count(Report.id).desc()).limit(6).all()
            district_summary = ", ".join([f"{dist}: {c}" for dist, c in district_counts if dist])

            # Active HEIs & proposals
            total_heis = db.query(func.count(HEI.id)).scalar() or 0
            total_proposals = db.query(func.count(Proposal.id)).scalar() or 0
            total_offers = db.query(func.count(IndustryOffer.id)).scalar() or 0
            total_funds = db.query(func.sum(IndustryOffer.funding_amount_inr)).scalar() or 0.0

            context_lines.append(f"\nLIVE GOVERNMENT & PLATFORM METRICS:")
            context_lines.append(f"- Total Grievances: {total_reports} (Resolved: {resolved_reports}, Pending/In-Progress: {pending_reports}, Critical: {critical_reports})")
            context_lines.append(f"- Top Districts by Volume: {district_summary or 'N/A'}")
            context_lines.append(f"- Domain Breakdown: {domain_summary or 'N/A'}")
            context_lines.append(f"- Academic Network: {total_heis} Partner HEIs, {total_proposals} Technical Proposals submitted")
            context_lines.append(f"- Industry CSR: {total_offers} Funding Offers totaling ₹{total_funds:,.2f} INR")

            # Recent critical reports
            crit_list = db.query(Report).filter(Report.priority.in_(["Critical", "High"])).order_by(Report.created_at.desc()).limit(5).all()
            if crit_list:
                context_lines.append(f"\nRECENT CRITICAL & HIGH PRIORITY REPORTS:")
                for r in crit_list:
                    context_lines.append(f"• [#{r.tracking_number}] {r.title} ({r.district} - {r.domain}) -> Status: {r.status}")

        elif role == "hei_reviewer":
            # HEI profile
            hei = db.query(HEI).filter(HEI.user_id == current_user.id).first()
            if not hei and current_user.organization:
                hei = db.query(HEI).filter(HEI.institute_name.ilike(f"%{current_user.organization}%")).first()

            if hei:
                context_lines.append(f"\nINSTITUTION PROFILE:")
                context_lines.append(f"- Institute: {hei.institute_name} (AISHE: {hei.aishe_code})")
                context_lines.append(f"- District: {hei.district}")
                context_lines.append(f"- Specializations: {', '.join(hei.specializations or [])}")

                # Assigned reports
                assigned = db.query(Report).filter(Report.assigned_hei_id == hei.id).order_by(Report.created_at.desc()).limit(8).all()
                if assigned:
                    context_lines.append(f"\nREPORTS ASSIGNED TO THIS HEI ({len(assigned)}):")
                    for r in assigned:
                        context_lines.append(f"• [#{r.tracking_number}] {r.title} ({r.domain}, Priority: {r.priority}) -> Status: {r.status}")
                else:
                    context_lines.append("\nREPORTS ASSIGNED: No reports currently assigned.")

                # Proposals submitted
                proposals = db.query(Proposal).filter(Proposal.hei_id == hei.id).order_by(Proposal.created_at.desc()).limit(5).all()
                if proposals:
                    context_lines.append(f"\nPROPOSALS SUBMITTED BY THIS HEI ({len(proposals)}):")
                    for p in proposals:
                        context_lines.append(f"• '{p.solution_title}' | Est. Budget: ₹{p.estimated_budget_inr:,.0f} INR | Status: {p.status}")

        elif role == "industry_partner":
            # Industry offers
            offers = db.query(IndustryOffer).filter(IndustryOffer.industry_user_id == current_user.id).all()
            total_pledged = sum(o.funding_amount_inr or 0 for o in offers)

            context_lines.append(f"\nCOMPANY CSR PORTFOLIO:")
            context_lines.append(f"- Total Funded Offers Made: {len(offers)}")
            context_lines.append(f"- Total CSR Funds Pledged: ₹{total_pledged:,.2f} INR")

            if offers:
                context_lines.append(f"RECENT OFFERS:")
                for o in offers[:5]:
                    context_lines.append(f"• Amount: ₹{o.funding_amount_inr:,.0f} | Type: {o.offer_type} | Status: {o.status} | Proposal ID: #{o.proposal_id}")

            # Top proposals available for CSR funding
            fundable = db.query(Proposal).filter(Proposal.status.in_(["Submitted", "Under_Review"])).limit(6).all()
            if fundable:
                context_lines.append(f"\nPROPOSALS READY FOR CSR FUNDING ({len(fundable)} available):")
                for p in fundable:
                    hei_name = p.hei.institute_name if p.hei else "HEI Partner"
                    report_title = p.report.title if p.report else "Civic Issue"
                    context_lines.append(f"• '{p.solution_title}' by {hei_name} | Problem: '{report_title}' | Budget: ₹{p.estimated_budget_inr:,.0f} INR")

    except Exception as e:
        context_lines.append(f"\n[Note: Database context fetch note: {e}]")

    return "\n".join(context_lines)


@router.post("", response_model=ChatResponse)
def chat_endpoint(
    request: ChatRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Public & Role-aware AI chatbot endpoint.
    - If user is logged in: provides personalized live DB context.
    - If user is NOT logged in (Guest): provides general platform guidance while
      strictly protecting private user data and requiring login for personal tracking.
    """
    user_role = (current_user.role if current_user else "guest").lower()

    # Build history list (list of dicts) for gemini_service
    history = [
        {"role": msg.role, "content": msg.content}
        for msg in (request.history or [])
    ]

    # Extract real-time database context (safe for guests)
    live_db_context = build_live_db_context(db, current_user, request.message)

    try:
        reply = chat_with_role(
            history=history,
            new_message=request.message,
            user_role=user_role,
            live_context=live_db_context,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chatbot error: {str(e)}",
        )

    return ChatResponse(reply=reply, role_context=user_role)
