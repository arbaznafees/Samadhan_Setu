import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), nullable=False, default="citizen") # citizen, hei_reviewer, industry_partner, govt_admin
    district = Column(String(100), default="Ranchi")
    organization = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    hei_profile = relationship("HEI", back_populates="user", uselist=False)
    reports = relationship("Report", back_populates="citizen", foreign_keys="Report.citizen_id")
    offers = relationship("IndustryOffer", back_populates="industry_user")
    notifications = relationship("Notification", back_populates="user")


class HEI(Base):
    __tablename__ = "heis"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    institute_name = Column(String(255), nullable=False, index=True)
    aishe_code = Column(String(50), unique=True, nullable=False)
    district = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    specializations = Column(JSON, default=list) # e.g. ["Water Resources", "Agriculture", "IoT", "Mining Safety"]
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50), nullable=True)
    active_projects_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="hei_profile")
    assigned_reports = relationship("Report", back_populates="assigned_hei")
    proposals = relationship("Proposal", back_populates="hei")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String(50), unique=True, index=True, nullable=False)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    citizen_name = Column(String(255), nullable=True)
    citizen_phone = Column(String(50), nullable=True)
    
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    raw_text = Column(Text, nullable=True)
    language = Column(String(50), default="en")
    
    domain = Column(String(100), default="General", index=True) # Water & Sanitation, Agriculture, etc.
    category = Column(String(100), default="General Issue")
    priority = Column(String(50), default="Medium") # Low, Medium, High, Critical
    status = Column(String(50), default="Submitted", index=True) # Submitted, Triaged, HEI_Assigned, Proposal_Submitted, Industry_Offered, In_Progress, Resolved, Rejected
    
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String(500), nullable=True)
    district = Column(String(100), default="Ranchi", index=True)
    
    media_urls = Column(JSON, default=list) # URLs of photos/videos in S3/R2
    embedding = Column(Vector(768), nullable=True) # 768-dim embedding from Gemini
    ai_summary = Column(Text, nullable=True)
    is_ai_simulated = Column(Boolean, default=False) # True if classified without live Gemini API key
    
    is_duplicate = Column(Boolean, default=False, index=True)
    duplicate_of_id = Column(Integer, ForeignKey("reports.id"), nullable=True)
    duplicate_similarity = Column(Float, nullable=True)
    
    assigned_hei_id = Column(Integer, ForeignKey("heis.id"), nullable=True)
    hei_match_score = Column(Float, nullable=True) # 0 to 100
    hei_match_reasons = Column(JSON, default=list) # explanations of match
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    citizen = relationship("User", back_populates="reports", foreign_keys=[citizen_id])
    assigned_hei = relationship("HEI", back_populates="assigned_reports")
    proposals = relationship("Proposal", back_populates="report")
    industry_offers = relationship("IndustryOffer", back_populates="report")
    audit_logs = relationship("AuditLog", back_populates="report")


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    hei_id = Column(Integer, ForeignKey("heis.id"), nullable=False)
    
    lead_faculty_name = Column(String(255), nullable=False)
    lead_faculty_email = Column(String(255), nullable=False)
    team_members = Column(JSON, default=list) # [{"name": "...", "role": "...", "dept": "..."}]
    
    solution_title = Column(String(300), nullable=False)
    solution_description = Column(Text, nullable=False)
    methodology = Column(Text, nullable=True)
    estimated_budget_inr = Column(Float, default=0.0)
    estimated_duration_months = Column(Integer, default=6)
    deliverables = Column(Text, nullable=True)
    status = Column(String(50), default="Submitted") # Submitted, Under_Review, Industry_Funded, Active, Completed
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    report = relationship("Report", back_populates="proposals")
    hei = relationship("HEI", back_populates="proposals")
    industry_offers = relationship("IndustryOffer", back_populates="proposal")


class IndustryOffer(Base):
    __tablename__ = "industry_offers"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id"), nullable=False)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    industry_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    company_name = Column(String(255), nullable=False)
    offer_type = Column(String(100), default="CSR_Grant") # CSR_Grant, Direct_Funding, Mentorship, Equipment_Support, Joint_R&D
    funding_amount_inr = Column(Float, default=0.0)
    mentorship_scope = Column(Text, nullable=True)
    message = Column(Text, nullable=True)
    contact_person = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False)
    status = Column(String(50), default="Offered") # Offered, Accepted, Under_Negotiation, Declined
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    proposal = relationship("Proposal", back_populates="industry_offers")
    report = relationship("Report", back_populates="industry_offers")
    industry_user = relationship("User", back_populates="offers")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role_target = Column(String(50), nullable=True) # citizen, hei_reviewer, industry_partner, govt_admin
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=True)
    action = Column(String(100), nullable=False)
    actor_name = Column(String(255), nullable=False)
    actor_role = Column(String(50), nullable=False)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    report = relationship("Report", back_populates="audit_logs")
