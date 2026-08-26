import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import HEI, Report, Proposal, User, Notification, AuditLog
from app.schemas.dtos import HEIOut, ReportOut, ProposalCreate, ProposalOut
from app.auth.dependencies import get_current_user, require_roles
from typing import List, Optional

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/hei", tags=["HEI Portal"])

@router.get("/institutes", response_model=List[HEIOut])
def list_institutes(db: Session = Depends(get_db)):
    """List all registered higher education institutions in Jharkhand."""
    return db.query(HEI).order_by(HEI.institute_name.asc()).all()


@router.get("/assigned-reports", response_model=List[ReportOut])
def get_assigned_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["hei_reviewer", "govt_admin"]))
):
    """
    HEI Reviewers see only reports routed to their institution.
    Govt admins can view all assigned reports.
    """
    if current_user.role == "hei_reviewer":
        hei = db.query(HEI).filter(HEI.user_id == current_user.id).first()
        if not hei:
            # If user has no linked HEI, fallback to first available or empty
            hei = db.query(HEI).first()
            if not hei:
                return []
        reports = db.query(Report).filter(Report.assigned_hei_id == hei.id).order_by(Report.created_at.desc()).all()
        return reports
    else:
        # Govt admin
        return db.query(Report).filter(Report.assigned_hei_id.isnot(None)).order_by(Report.created_at.desc()).all()


@router.post("/proposals", response_model=ProposalOut, status_code=status.HTTP_201_CREATED)
def submit_proposal(
    proposal_in: ProposalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["hei_reviewer", "govt_admin"]))
):
    """
    HEI forms an interdisciplinary team and submits a structured solution proposal.
    """
    # Identify HEI
    hei = None
    if current_user.role == "hei_reviewer":
        hei = db.query(HEI).filter(HEI.user_id == current_user.id).first()
    
    if not hei:
        # Check report's assigned HEI
        report = db.query(Report).filter(Report.id == proposal_in.report_id).first()
        if report and report.assigned_hei_id:
            hei = db.query(HEI).filter(HEI.id == report.assigned_hei_id).first()
        else:
            hei = db.query(HEI).first()

    if not hei:
        raise HTTPException(status_code=400, detail="Could not determine affiliated HEI institution.")

    report = db.query(Report).filter(Report.id == proposal_in.report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Target report not found.")

    team_data = [m.dict() for m in proposal_in.team_members]

    proposal = Proposal(
        report_id=proposal_in.report_id,
        hei_id=hei.id,
        lead_faculty_name=proposal_in.lead_faculty_name,
        lead_faculty_email=proposal_in.lead_faculty_email,
        team_members=team_data,
        solution_title=proposal_in.solution_title,
        solution_description=proposal_in.solution_description,
        methodology=proposal_in.methodology,
        estimated_budget_inr=proposal_in.estimated_budget_inr,
        estimated_duration_months=proposal_in.estimated_duration_months,
        deliverables=proposal_in.deliverables,
        status="Submitted"
    )
    db.add(proposal)
    
    # Update report status
    report.status = "Proposal_Submitted"

    # Notification to Industry Partners & Govt Admins
    notif_industry = Notification(
        role_target="industry_partner",
        title="New Solution Proposal Available for CSR Funding",
        message=f"{hei.institute_name} submitted a proposal for: '{proposal.solution_title[:45]}...'",
        link="/industry"
    )
    db.add(notif_industry)

    # Notification to Citizen
    if report.citizen_id:
        notif_citizen = Notification(
            user_id=report.citizen_id,
            role_target="citizen",
            title="Solution Proposal Formulated for Your Issue",
            message=f"{hei.institute_name} has formulated an action plan: '{proposal.solution_title[:40]}'.",
            link=f"/citizen?track={report.tracking_number}"
        )
        db.add(notif_citizen)

    # Audit log
    audit = AuditLog(
        report_id=report.id,
        action="PROPOSAL_SUBMITTED",
        actor_name=proposal_in.lead_faculty_name,
        actor_role="hei_reviewer",
        details={
            "proposal_title": proposal.solution_title,
            "budget": proposal.estimated_budget_inr,
            "hei": hei.institute_name
        }
    )
    db.add(audit)

    db.commit()
    db.refresh(proposal)
    return proposal


@router.get("/proposals", response_model=List[ProposalOut])
def list_proposals(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["hei_reviewer", "govt_admin"]))
):
    if current_user.role == "hei_reviewer":
        hei = db.query(HEI).filter(HEI.user_id == current_user.id).first()
        if hei:
            return db.query(Proposal).filter(Proposal.hei_id == hei.id).order_by(Proposal.created_at.desc()).all()
    return db.query(Proposal).order_by(Proposal.created_at.desc()).all()


@router.patch("/reports/{report_id}/status")
def update_report_status_hei(
    report_id: int,
    status_update: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["hei_reviewer", "govt_admin"]))
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    new_status = status_update.get("status")
    if new_status:
        report.status = new_status
        db.commit()
    return {"message": "Status updated successfully", "status": report.status}
