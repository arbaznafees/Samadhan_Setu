import logging
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.entities import Report, Proposal, IndustryOffer, HEI, AuditLog, User, Notification
from app.schemas.dtos import GovtAnalyticsResponse, DomainStat, DistrictStat, ReportOut, HEIAssignOverride
from app.auth.dependencies import get_current_user, require_roles
from typing import List, Optional

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/govt", tags=["Government Portal"])

@router.get("/analytics", response_model=GovtAnalyticsResponse)
def get_govt_analytics(db: Session = Depends(get_db)):
    """
    Live real-time aggregation queries from PostgreSQL — strictly no hardcoded mock metrics.
    """
    total_reports = db.query(Report).count()
    resolved_reports = db.query(Report).filter(Report.status == "Resolved").count()
    active_projects = db.query(Proposal).filter(Proposal.status.in_(["Submitted", "Under_Review", "Industry_Funded", "Active"])).count()
    
    industry_funded_projects = db.query(Proposal).filter(Proposal.status == "Industry_Funded").count()
    
    total_funding_res = db.query(func.sum(IndustryOffer.funding_amount_inr)).scalar()
    total_csr_funding_inr = float(total_funding_res or 0.0)
    
    resolution_rate = (resolved_reports / total_reports * 100.0) if total_reports > 0 else 0.0
    
    ai_triage_count = db.query(Report).filter(Report.status != "Submitted").count()
    duplicate_flagged_count = db.query(Report).filter(Report.is_duplicate == True).count()

    # 1. Domain breakdown
    domain_counts = db.query(Report.domain, func.count(Report.id)).group_by(Report.domain).all()
    domain_breakdown = []
    for d_name, count in domain_counts:
        pct = (count / total_reports * 100.0) if total_reports > 0 else 0.0
        domain_breakdown.append(DomainStat(domain=d_name or "General", count=count, percentage=round(pct, 1)))

    # 2. District breakdown
    district_rows = db.query(Report.district, func.count(Report.id)).group_by(Report.district).all()
    district_breakdown = []
    for dist_name, d_count in district_rows:
        d_resolved = db.query(Report).filter(Report.district == dist_name, Report.status == "Resolved").count()
        district_breakdown.append(DistrictStat(district=dist_name or "Unknown", count=d_count, resolved_count=d_resolved))

    # 3. Recent reports
    recent_reports = db.query(Report).order_by(Report.created_at.desc()).limit(10).all()

    return GovtAnalyticsResponse(
        total_reports=total_reports,
        resolved_reports=resolved_reports,
        active_projects=active_projects,
        industry_funded_projects=industry_funded_projects,
        resolution_rate_percentage=round(resolution_rate, 1),
        total_csr_funding_inr=total_csr_funding_inr,
        ai_triage_count=ai_triage_count,
        duplicate_flagged_count=duplicate_flagged_count,
        domain_breakdown=domain_breakdown,
        district_breakdown=district_breakdown,
        recent_reports=recent_reports
    )


@router.get("/reports", response_model=List[ReportOut])
def list_all_reports_govt(
    domain: Optional[str] = None,
    district: Optional[str] = None,
    status_filter: Optional[str] = None,
    is_duplicate: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    if domain and domain != "All":
        query = query.filter(Report.domain == domain)
    if district and district != "All":
        query = query.filter(Report.district == district)
    if status_filter and status_filter != "All":
        query = query.filter(Report.status == status_filter)
    if is_duplicate is not None:
        query = query.filter(Report.is_duplicate == is_duplicate)

    return query.order_by(Report.created_at.desc()).all()


@router.post("/override-hei/{report_id}", response_model=ReportOut)
def override_hei_assignment(
    report_id: int,
    override_data: HEIAssignOverride,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["govt_admin"]))
):
    """
    Government Administrator manually re-assigns a report to a different HEI.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    new_hei = db.query(HEI).filter(HEI.id == override_data.hei_id).first()
    if not new_hei:
        raise HTTPException(status_code=404, detail="Target HEI not found")

    old_hei_id = report.assigned_hei_id
    report.assigned_hei_id = new_hei.id
    report.hei_match_score = 100.0  # Administrator override
    reasons = report.hei_match_reasons or []
    reasons.append(f"Admin override by {current_user.full_name}: {override_data.reason}")
    report.hei_match_reasons = reasons
    report.status = "HEI_Assigned"

    # Notification to newly assigned HEI
    if new_hei.user_id:
        notif = Notification(
            user_id=new_hei.user_id,
            role_target="hei_reviewer",
            title="Administrative HEI Reassignment",
            message=f"Report '{report.title[:40]}' reassigned to your institution by State Admin.",
            link="/hei"
        )
        db.add(notif)

    # Audit log
    audit = AuditLog(
        report_id=report.id,
        action="ADMIN_HEI_OVERRIDE",
        actor_name=current_user.full_name,
        actor_role="govt_admin",
        details={
            "old_hei_id": old_hei_id,
            "new_hei_id": new_hei.id,
            "new_hei_name": new_hei.institute_name,
            "reason": override_data.reason
        }
    )
    db.add(audit)

    db.commit()
    db.refresh(report)
    return report


@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["govt_admin"]))
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": log.id,
            "report_id": log.report_id,
            "action": log.action,
            "actor_name": log.actor_name,
            "actor_role": log.actor_role,
            "details": log.details,
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]
