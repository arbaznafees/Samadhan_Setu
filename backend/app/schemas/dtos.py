from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ==================== AUTH SCHEMAS ====================
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    phone: Optional[str] = None
    role: str = Field(default="citizen") # citizen, hei_reviewer, industry_partner, govt_admin
    district: Optional[str] = "Ranchi"
    organization: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str
    district: Optional[str] = None
    organization: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ==================== HEI SCHEMAS ====================
class HEICreate(BaseModel):
    institute_name: str
    aishe_code: str
    district: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    specializations: List[str] = []
    contact_email: EmailStr
    contact_phone: Optional[str] = None

class HEIOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    institute_name: str
    aishe_code: str
    district: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    specializations: List[str] = []
    contact_email: str
    contact_phone: Optional[str] = None
    active_projects_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== TEAM MEMBER & PROPOSAL SCHEMAS ====================
class TeamMember(BaseModel):
    name: str
    role: str # e.g. "Principal Investigator", "Co-PI", "Student Lead", "Field Researcher"
    dept: str

class ProposalCreate(BaseModel):
    report_id: int
    lead_faculty_name: str
    lead_faculty_email: EmailStr
    team_members: List[TeamMember] = []
    solution_title: str
    solution_description: str
    methodology: Optional[str] = None
    estimated_budget_inr: float = 0.0
    estimated_duration_months: int = 6
    deliverables: Optional[str] = None

class ProposalOut(BaseModel):
    id: int
    report_id: int
    hei_id: int
    lead_faculty_name: str
    lead_faculty_email: str
    team_members: List[Dict[str, Any]] = []
    solution_title: str
    solution_description: str
    methodology: Optional[str] = None
    estimated_budget_inr: float
    estimated_duration_months: int
    deliverables: Optional[str] = None
    status: str
    created_at: datetime
    hei: Optional[HEIOut] = None

    class Config:
        from_attributes = True

# ==================== INDUSTRY OFFER SCHEMAS ====================
class IndustryOfferCreate(BaseModel):
    proposal_id: int
    offer_type: str = "CSR_Grant" # CSR_Grant, Direct_Funding, Mentorship, Equipment_Support, Joint_R&D
    funding_amount_inr: float = 0.0
    mentorship_scope: Optional[str] = None
    message: Optional[str] = None
    contact_person: str
    contact_email: EmailStr

class IndustryOfferOut(BaseModel):
    id: int
    proposal_id: int
    report_id: int
    industry_user_id: int
    company_name: str
    offer_type: str
    funding_amount_inr: float
    mentorship_scope: Optional[str] = None
    message: Optional[str] = None
    contact_person: str
    contact_email: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== REPORT SCHEMAS ====================
class ReportCreate(BaseModel):
    title: str
    description: str
    citizen_name: Optional[str] = None
    citizen_phone: Optional[str] = None
    domain: Optional[str] = None
    category: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    district: Optional[str] = "Ranchi"
    media_urls: List[str] = []

class ReportOut(BaseModel):
    id: int
    tracking_number: str
    citizen_id: Optional[int] = None
    citizen_name: Optional[str] = None
    citizen_phone: Optional[str] = None
    title: str
    description: str
    language: str
    domain: str
    category: str
    priority: str
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    district: str
    media_urls: List[str] = []
    ai_summary: Optional[str] = None
    is_ai_simulated: bool = False
    is_duplicate: bool = False
    duplicate_of_id: Optional[int] = None
    duplicate_similarity: Optional[float] = None
    assigned_hei_id: Optional[int] = None
    hei_match_score: Optional[float] = None
    hei_match_reasons: List[str] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    assigned_hei: Optional[HEIOut] = None
    proposals: List[ProposalOut] = []
    industry_offers: List[IndustryOfferOut] = []

    class Config:
        from_attributes = True

class HEIAssignOverride(BaseModel):
    hei_id: int
    reason: Optional[str] = "Manual reassignment by administrator"

# ==================== NOTIFICATION SCHEMAS ====================
class NotificationOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    role_target: Optional[str] = None
    title: str
    message: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== ANALYTICS SCHEMAS ====================
class DistrictStat(BaseModel):
    district: str
    count: int
    resolved_count: int

class DomainStat(BaseModel):
    domain: str
    count: int
    percentage: float

class GovtAnalyticsResponse(BaseModel):
    total_reports: int
    resolved_reports: int
    active_projects: int
    industry_funded_projects: int
    resolution_rate_percentage: float
    total_csr_funding_inr: float
    ai_triage_count: int
    duplicate_flagged_count: int
    domain_breakdown: List[DomainStat]
    district_breakdown: List[DistrictStat]
    recent_reports: List[ReportOut]


# ==================== CHATBOT SCHEMAS ====================
class ChatMessageIn(BaseModel):
    role: str  # "user" or "model"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessageIn]
    portal: str = "citizen"  # citizen, hei, industry, govt

class ChatAction(BaseModel):
    type: str
    data: Dict[str, Any] = {}

class ChatResponse(BaseModel):
    reply: str
    actions: List[ChatAction] = []
    is_simulated: bool = False