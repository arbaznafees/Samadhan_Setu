import os
import json
import logging
import time
import hashlib
import random
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

# In-memory caching for classification & embeddings to protect free-tier rate limits
_CLASSIFICATION_CACHE: Dict[str, Dict[str, Any]] = {}
_EMBEDDING_CACHE: Dict[str, List[float]] = {}

_client = None
_IS_KEY_CONFIGURED = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip())

if _IS_KEY_CONFIGURED:
    try:
        from google import genai
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
        logger.info(f"Google Gemini genai.Client initialized with API Key.")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini Client: {e}")
        _IS_KEY_CONFIGURED = False
else:
    logger.warning(
        "==================================================================\n"
        " [GEMINI AI WARNING]: GEMINI_API_KEY is not set or empty.\n"
        " Gemini AI is running in SIMULATION MODE.\n"
        " All classification and embeddings will use deterministic rules.\n"
        " Reports will be tagged with 'is_ai_simulated: True' and display\n"
        " an 'AI: Simulated' badge on Gov and HEI portals.\n"
        "=================================================================="
    )

def _get_text_hash(text: str) -> str:
    return hashlib.sha256(text.strip().lower().encode("utf-8")).hexdigest()

def _deterministic_mock_embedding(text: str, dim: int = 768) -> List[float]:
    """
    Generate a reproducible, normalized pseudo-embedding vector for simulation mode
    with domain/topic semantic clustering so near-duplicate reports produce >80% similarity.
    """
    text_lower = text.lower()
    raw_vec = [0.0] * dim

    keywords = ["water", "handpump", "borewell", "iron", "turbid", "khunti", "contamination", "filtration", 
                "agriculture", "crop", "irrigation", "soil", "wilt", "pothole", "road", "bridge", 
                "hospital", "swasthya", "electricity", "transformer", "mining", "jharia"]
    
    matched_keywords = [k for k in keywords if k in text_lower]
    for k in matched_keywords:
        k_seed = int(hashlib.md5(f"cluster_{k}".encode("utf-8")).hexdigest()[:8], 16)
        rng_k = random.Random(k_seed)
        for i in range(dim):
            raw_vec[i] += rng_k.gauss(0, 1.5)

    words = [w.strip(".,;:?!'\"()[]") for w in text_lower.split() if len(w) > 2]
    for w in words:
        w_seed = int(hashlib.md5(w.encode("utf-8")).hexdigest()[:8], 16)
        rng_w = random.Random(w_seed)
        for i in range(dim):
            raw_vec[i] += rng_w.gauss(0, 0.4)

    base_seed = int(hashlib.md5(text.encode("utf-8")).hexdigest()[:8], 16)
    rng_base = random.Random(base_seed)
    for i in range(dim):
        raw_vec[i] += rng_base.gauss(0, 0.1)
            
    norm = sum(x * x for x in raw_vec) ** 0.5 or 1.0
    return [x / norm for x in raw_vec]

def _call_gemini_with_backoff(prompt: str, max_retries: int = 3) -> str:
    """Execute Gemini API call with exponential backoff for rate limits."""
    delay = 1.0
    model_name = settings.GEMINI_MODEL or "gemini-3.5-flash-lite"
    
    for attempt in range(max_retries):
        try:
            response = _client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            return response.text
        except Exception as e:
            err_msg = str(e).lower()
            if ("429" in err_msg or "rate limit" in err_msg or "resource exhausted" in err_msg) and attempt < max_retries - 1:
                logger.warning(f"Gemini rate limited (429), retrying in {delay:.1f}s (attempt {attempt + 1}/{max_retries})...")
                time.sleep(delay)
                delay *= 2.0
            else:
                logger.error(f"Gemini generate_content error: {e}")
                raise e
    raise RuntimeError("Gemini API call failed after retries")

def classify_and_summarize_report(title: str, description: str) -> Dict[str, Any]:
    """
    Classifies the grievance/issue into domain, category, priority, language,
    generates an executive summary, and notes whether simulated.
    """
    combined_text = f"{title}\n\n{description}".strip()
    cache_key = _get_text_hash(combined_text)
    
    if cache_key in _CLASSIFICATION_CACHE:
        logger.info("Retrieved report classification from cache.")
        return _CLASSIFICATION_CACHE[cache_key]

    if not _IS_KEY_CONFIGURED or _client is None:
        logger.warning(f"[SIMULATION] Triaging report '{title[:40]}...' via simulated AI heuristics.")
        result = _simulate_classification(title, description)
        _CLASSIFICATION_CACHE[cache_key] = result
        return result

    prompt = f"""
You are the AI Triage Specialist for "Samadhan Setu Jharkhand", a state civic grievance-to-solution platform.
Analyze the citizen grievance below.

Title: {title}
Description: {description}

Respond ONLY with a valid JSON object matching this schema:
{{
  "domain": "One of: [Water & Sanitation, Agriculture & Irrigation, Roads & Infrastructure, Healthcare, Education & Skilling, Environment & Forest, Electricity & Energy, Rural Livelihood, Other]",
  "category": "Specific category (e.g. Drinking Water & Contamination, Potholes & Road Repair, Canal Breach, Rural Telemedicine, Transformer Failure, Crop Wilt)",
  "priority": "One of: [Low, Medium, High, Critical]",
  "language": "Detected language (e.g. English, Hindi, Hinglish)",
  "ai_summary": "Concise 2-sentence summary of the core grievance and community impact",
  "key_keywords": ["3-5", "domain", "keywords"]
}}
Return strictly valid JSON without markdown wrapping or commentary.
"""
    t0 = time.time()
    try:
        raw_text = _call_gemini_with_backoff(prompt)
        latency_ms = (time.time() - t0) * 1000
        cleaned_text = raw_text.strip()
        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text.strip("`").replace("json", "", 1).strip()
        
        parsed = json.loads(cleaned_text)
        result = {
            "domain": parsed.get("domain", "General"),
            "category": parsed.get("category", "Public Grievance"),
            "priority": parsed.get("priority", "Medium"),
            "language": parsed.get("language", "English"),
            "ai_summary": parsed.get("ai_summary", description[:200]),
            "key_keywords": parsed.get("key_keywords", []),
            "is_simulated": False,
            "latency_ms": round(latency_ms, 2)
        }
        logger.info(f"Gemini Live Classification succeeded in {latency_ms:.1f}ms: Domain={result['domain']}, Priority={result['priority']}")
        _CLASSIFICATION_CACHE[cache_key] = result
        return result
    except Exception as e:
        logger.warning(f"Live Gemini classification failed ({e}), falling back to simulated classification.")
        result = _simulate_classification(title, description)
        _CLASSIFICATION_CACHE[cache_key] = result
        return result

def _simulate_classification(title: str, description: str) -> Dict[str, Any]:
    text = f"{title} {description}".lower()
    
    if any(w in text for w in ["water", "pani", "paani", "jal", "borewell", "handpump", "pipe", "drainage", "sewage", "contamination", "fluoride", "arsenic", "iron", "turbidity"]):
        domain = "Water & Sanitation"
        category = "Drinking Water & Contamination"
        keywords = ["water quality", "potable water", "filtration", "handpump", "iron removal"]
    elif any(w in text for w in ["kisan", "crop", "fasal", "agriculture", "irrigation", "soil", "pest", "fertilizer", "drought", "farming", "wilt"]):
        domain = "Agriculture & Irrigation"
        category = "Crop Health & Micro-Irrigation"
        keywords = ["micro-irrigation", "crop yield", "soil salinity", "agritech"]
    elif any(w in text for w in ["road", "sadak", "bridge", "pul", "pothole", "gaddha", "highway", "traffic", "construction", "transport"]):
        domain = "Roads & Infrastructure"
        category = "Rural Connectivity & Road Repair"
        keywords = ["rural roads", "structural engineering", "bitumen quality"]
    elif any(w in text for w in ["hospital", "doctor", "swasthya", "clinic", "medicine", "dawa", "ambulance", "phc", "health", "fever", "malaria"]):
        domain = "Healthcare"
        category = "Primary Healthcare & Telemedicine"
        keywords = ["rural health", "telemedicine", "medical diagnostics"]
    elif any(w in text for w in ["school", "college", "shiksha", "teacher", "student", "classroom", "books", "smart class", "education"]):
        domain = "Education & Skilling"
        category = "Smart Classrooms & Vocational Skills"
        keywords = ["educational tech", "smart classroom", "vocational training"]
    elif any(w in text for w in ["electric", "bijli", "solar", "transformer", "power cut", "light", "energy", "grid"]):
        domain = "Electricity & Energy"
        category = "Renewable Energy & Grid Stability"
        keywords = ["solar microgrid", "transformer maintenance", "energy storage"]
    elif any(w in text for w in ["forest", "jungle", "pollution", "tree", "mining", "dust", "coal", "environment", "wildlife"]):
        domain = "Environment & Forest"
        category = "Environmental Monitoring & Mine Reclamation"
        keywords = ["mine safety", "afforestation", "air quality monitoring"]
    else:
        domain = "Rural Livelihood"
        category = "Community Development"
        keywords = ["rural development", "community tech", "skill development"]

    if any(w in text for w in ["urgent", "danger", "critical", "outbreak", "death", "collapse", "khatra", "emergency"]):
        priority = "Critical"
    elif any(w in text for w in ["severe", "broken", "loss", "heavy", "toxic", "turbid", "iron"]):
        priority = "High"
    elif any(w in text for w in ["minor", "request", "suggestion"]):
        priority = "Low"
    else:
        priority = "Medium"

    is_hindi = any('\u0900' <= char <= '\u097F' for char in text)
    language = "Hindi" if is_hindi else "English"

    summary = f"{title}. {description[:140]}..."

    return {
        "domain": domain,
        "category": category,
        "priority": priority,
        "language": language,
        "ai_summary": summary,
        "key_keywords": keywords,
        "is_simulated": True,
        "latency_ms": 1.2
    }

def get_text_embedding(text: str) -> List[float]:
    """
    Generate 768-dimensional embedding for vector search / deduplication.
    Cached locally to avoid repeated API hits.
    """
    if not text:
        text = "empty query"
    cache_key = _get_text_hash(text)
    if cache_key in _EMBEDDING_CACHE:
        return _EMBEDDING_CACHE[cache_key]

    if not _IS_KEY_CONFIGURED or _client is None:
        emb = _deterministic_mock_embedding(text, dim=768)
        _EMBEDDING_CACHE[cache_key] = emb
        return emb

    try:
        from google.genai import types
        embed_model = settings.GEMINI_EMBEDDING_MODEL or "gemini-embedding-001"
        res = _client.models.embed_content(
            model=embed_model,
            contents=text,
            config=types.EmbedContentConfig(output_dimensionality=768)
        )
        embedding = res.embeddings[0].values

        if len(embedding) < 768:
            embedding = list(embedding) + [0.0] * (768 - len(embedding))
        else:
            embedding = list(embedding[:768])
            
        _EMBEDDING_CACHE[cache_key] = embedding
        return embedding
    except Exception as e:
        logger.warning(f"Live Gemini embed_content failed ({e}), falling back to deterministic embedding.")
        emb = _deterministic_mock_embedding(text, dim=768)
        _EMBEDDING_CACHE[cache_key] = emb
        return emb

def chat_with_role(history: List[Dict[str, str]], new_message: str, user_role: str, live_context: Optional[str] = None) -> str:
    """
    Full-fledged, highly capable, role-aware, multilingual AI chatbot using Gemini.
    Dynamically mirrors the user's language (Hindi, Hinglish, English, regional),
    answers any question with real-time live database context, drafts documents,
    provides deep platform knowledge, and behaves as an intelligent personal assistant.
    """
    if not _IS_KEY_CONFIGURED or _client is None:
        simulated_hints = {
            "citizen": "Namaste! Main Samadhan Mitra hoon. Main aapki shikayat darj karne aur platform par madad ke liye taiyaar hoon. (Real AI ke liye GEMINI_API_KEY configure karein).",
            "govt_admin": f"[Govt Assistant]: Ready to assist with analytics, grievance triage, and policy drafting. Configure GEMINI_API_KEY for live AI responses. Your query: '{new_message}'",
            "industry_partner": f"[CSR Advisor]: Ready to assist with project evaluation and CSR funding recommendations. Configure GEMINI_API_KEY for live AI. Your query: '{new_message}'",
            "hei_reviewer": f"[Research Coordinator]: Ready to assist with academic proposal drafting and department matching. Configure GEMINI_API_KEY for live AI. Your query: '{new_message}'",
        }
        return simulated_hints.get(user_role.lower(), f"[Samadhan AI]: {new_message}")

    # Role-specific identity & expertise
    role_contexts = {
        "citizen": """You are 'Samadhan Mitra' (समाधान मित्र), an intelligent, warm, and highly capable AI assistant for citizens on the Samadhan Setu Jharkhand platform.
Your mission is to help citizens with everything they need:
- Check their actual complaints, tracking numbers, and progress from the database.
- Explaining how to file complaints, upload photos, and track grievances on Samadhan Setu.
- Drafting well-written, formal complaint descriptions for broken roads, water supply, electricity/transformer failure, health clinics, schools, agriculture, etc.
- Helping with any question, guidance, government schemes, public services, or general help they ask for.""",

        "govt_admin": """You are 'Samadhan Analytics & Policy AI', a senior data analyst and executive policy assistant for Government Officials and District Administrators on Samadhan Setu Jharkhand.
Your mission is to provide deep, actionable support:
- Answering queries about live database statistics, grievance counts, district-wise trends, and critical complaints.
- Drafting official government orders, press releases, public memos, departmental notices, and policy recommendations.
- Evaluating HEI performance (BIT Mesra, IIT ISM, NIT Jamshedpur, BAU) and CSR partnership allocations.""",

        "industry_partner": """You are 'CSR Impact Navigator AI', a strategic investment advisor and CSR portfolio manager for Corporate & Industry Partners on Samadhan Setu Jharkhand.
Your mission is to assist corporate leaders:
- Reviewing live CSR funding proposals submitted by HEIs awaiting corporate grants.
- Tracking the company's pledged CSR funds, active offers, and social impact metrics.
- Drafting CSR proposals, board presentations, MoUs with HEIs, and impact reports.""",

        "guest": """You are 'Samadhan AI', an informative and helpful public guide for visitors and citizens on the Samadhan Setu Jharkhand platform.
Your mission is:
- Explain what Samadhan Setu Jharkhand is: a state-backed platform connecting citizen grievances (water, roads, electricity, health, agriculture) with institutional R&D solutions from Jharkhand HEIs (BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur, BAU) and CSR corporate sponsorship (Tata Steel, etc.).
- Guide visitors on how to register, login, file complaints, and upload evidence.
- Help visitors draft civic complaint letters or applications for authorities.
- If the visitor asks about personal data (like 'Where is my complaint?', 'Show my reports', 'What is my status?'), politely instruct them to **Log In** first to access their personalized dashboard and private tracking.""",

        "hei_reviewer": """You are 'Research & Innovation Coordinator AI', an advanced academic research assistant for University Professors, Deans, and Researchers (BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur, BAU Ranchi, etc.) on Samadhan Setu Jharkhand.
Your mission is to empower academic teams:
- Reviewing live civic grievances assigned to this HEI from the database.
- Drafting comprehensive technical proposals, research methodologies, pilot intervention plans, and budgets for civic problems.
- Helping with academic writing, literature context, research frameworks, and any technical questions."""
    }

    role_desc = role_contexts.get(user_role.lower(), "You are Samadhan AI, a helpful public AI assistant on Samadhan Setu Jharkhand.")

    db_context_section = ""
    if live_context and live_context.strip():
        db_context_section = f"""
### 🗄️ REAL-TIME PLATFORM & USER DATABASE CONTEXT:
The following is live data fetched directly from the Samadhan Setu database for this logged-in user and session.
Use this live data to answer questions accurately (e.g. when the user asks about their complaints, tracking numbers, status, or system statistics):
{live_context.strip()}
"""

    system_instruction = f"""{role_desc}
{db_context_section}
### CRITICAL CORE INSTRUCTIONS:
1. **STRICT PLATFORM & CIVIC DOMAIN BOUNDARY (MANDATORY RESTRICTION)**:
   - You are EXCLUSIVELY an assistant for the **Samadhan Setu Jharkhand** platform and civic governance/issues in Jharkhand.
   - **ALLOWED TOPICS**:
     * Samadhan Setu features: filing complaints, checking status, tracking numbers (JH-2026-XXXX), photo uploads, department selection.
     * Civic problems & solutions: Water & Sanitation, Electricity/Transformers, Roads & Potholes, Agriculture & Crops, Healthcare & PHCs, Education & Schools, Environment & Mining safety, Rural development.
     * Drafting civic documents: Complaint applications to Mukhiya, BDO, DC, or Department heads, official notices, HEI technical proposals, CSR funding briefs.
     * User's role tasks: checking their filed complaints, district statistics, HEI assigned projects, CSR fund allocations.
   - **STRICTLY OUT-OF-SCOPE (DISALLOWED) TOPICS**:
     * Movies, celebrities, cricket, sports, gaming, general coding/programming unrelated to the platform, general world trivia/history/math homework, personal gossip, or unrelated topics.
   - **HOW TO HANDLE OUT-OF-SCOPE QUESTIONS**:
     * Politely decline in the EXACT SAME language the user asked in.
     * State that you are dedicated solely to Samadhan Setu and Jharkhand civic assistance, and invite them to ask about civic issues or platform features.
     * *Hindi example*: "Kshama karein, main keval **Samadhan Setu** platform aur nagrik samasyaon (jaise paani, bijli, sadak, swasthya, kheti) se judi madad ke liye hoon. Kripya platform ya civic samasya se sambandhit sawaal poochhein."
     * *English example*: "I apologize, but I am dedicated exclusively to the **Samadhan Setu Jharkhand** platform and civic grievance resolution. Please ask me questions related to civic issues, filing reports, or platform features."

2. **LANGUAGE MIRRORING (HIGHEST PRIORITY)**:
   - If user asks in **Hindi (Devanagari)** -> Respond in **pure, fluent, natural Hindi (हिन्दी)**.
   - If user asks in **Hinglish (Roman Hindi, e.g. "mera paani ka problem kab solve hoga?")** -> Respond in **natural, conversational Hinglish**.
   - If user asks in **English** -> Respond in **crisp, professional English**.
   - If user asks in any regional language (Bhojpuri, Nagpuri, Bengali, etc.) -> Match their language naturally.
   - NEVER force English if the user wrote in Hindi/Hinglish. Match the exact tone and dialect of the user.

3. **DATABASE AWARENESS**:
   - If the user asks about their grievances, recent complaints, proposal status, or platform stats, look at the REAL-TIME DATABASE CONTEXT above and give them the exact status, tracking number, assigned HEI, and details.
   - If they have no filed grievances yet, guide them politely on how to file one.

4. **HELPFUL & SOLUTION-ORIENTED**:
   - For any allowed civic request, do whatever the user needs (drafting complete formal applications, explaining government procedures, giving step-by-step guidance).

5. **FORMATTING & TONE**:
   - Use clean Markdown formatting (**bold**, bullet points, numbered steps, headers) to make responses easy to read.
   - Be polite, supportive, and solution-oriented.
"""

    conversation = system_instruction + "\n\n--- Conversation History ---\n"

    for msg in history:
        role_label = "User" if msg.get("role") == "user" else "Assistant"
        content = msg.get("content", "")
        conversation += f"{role_label}: {content}\n"

    conversation += f"User: {new_message}\nAssistant:"

    try:
        model_name = settings.GEMINI_MODEL or "gemini-2.0-flash"
        # Try primary model
        response = _client.models.generate_content(
            model=model_name,
            contents=conversation
        )
        if response and response.text:
            return response.text.strip()
        return "Main aapki baat samajh gaya hoon. Kripya thoda aur vistaar se batayein taaki main behtar madad kar sakun."
    except Exception as e:
        logger.error(f"Chatbot Gemini error with model {model_name}: {e}")
        # Fallback to gemini-2.0-flash or gemini-1.5-flash if configured model had issue
        try:
            fallback_model = "gemini-2.0-flash"
            res = _client.models.generate_content(
                model=fallback_model,
                contents=conversation
            )
            if res and res.text:
                return res.text.strip()
        except Exception as e2:
            logger.error(f"Fallback Gemini model failed too: {e2}")
        return "Kshama karein, abhi AI server se connect karne mein samasya aa rahi hai. Kripya kuch samay baad punah prayas karein."


