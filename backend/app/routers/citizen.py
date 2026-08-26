import random
import logging
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import Report, User, AuditLog
from app.schemas.dtos import ReportCreate, ReportOut
from app.auth.dependencies import get_optional_current_user, get_current_user
from app.celery_tasks import triage_and_process_report_task, process_report_pipeline_sync
from typing import List, Optional

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/citizen", tags=["Citizen Portal"])

def generate_tracking_number() -> str:
    rand_num = random.randint(1000, 9999)
    return f"JH-2026-{rand_num}"

@router.post("/reports", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def submit_report(
    report_in: ReportCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Citizen submits a new grievance/issue.
    Saves to PostgreSQL and dispatches AI Triage & Dedup & HEI matching.
    """
    tracking_num = generate_tracking_number()
    while db.query(Report).filter(Report.tracking_number == tracking_num).first():
        tracking_num = generate_tracking_number()

    citizen_id = current_user.id if current_user else None
    citizen_name = current_user.full_name if current_user else (report_in.citizen_name or "Anonymous Citizen")
    citizen_phone = current_user.phone if current_user else report_in.citizen_phone

    report = Report(
        tracking_number=tracking_num,
        citizen_id=citizen_id,
        citizen_name=citizen_name,
        citizen_phone=citizen_phone,
        title=report_in.title,
        description=report_in.description,
        raw_text=f"{report_in.title}\n{report_in.description}",
        domain=report_in.domain or "General",
        category=report_in.category or "Grievance",
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        address=report_in.address,
        district=report_in.district or "Ranchi",
        media_urls=report_in.media_urls or [],
        status="Submitted"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Log initial citizen submission
    audit = AuditLog(
        report_id=report.id,
        action="REPORT_SUBMITTED",
        actor_name=citizen_name,
        actor_role="citizen",
        details={"tracking_number": tracking_num, "district": report.district}
    )
    db.add(audit)
    db.commit()

    # Trigger Async Celery Task or Background Worker
    try:
        triage_and_process_report_task.delay(report.id)
        logger.info(f"Dispatched Celery triage task for report #{report.id}")
    except Exception as e:
        logger.warning(f"Celery dispatch failed ({e}), running triage pipeline synchronously in background.")
        background_tasks.add_task(process_report_pipeline_sync, report.id)

    db.refresh(report)
    return report


@router.get("/reports", response_model=List[ReportOut])
def list_citizen_reports(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Lists citizen's own submitted reports, or latest public feed if not logged in."""
    query = db.query(Report)
    if current_user and current_user.role == "citizen":
        query = query.filter(Report.citizen_id == current_user.id)
    
    reports = query.order_by(Report.created_at.desc()).limit(50).all()
    return reports


@router.get("/track/{tracking_number}", response_model=ReportOut)
def track_report_by_number(tracking_number: str, db: Session = Depends(get_db)):
    """Public lookup for citizens to track their grievance progress."""
    clean_number = tracking_number.strip().upper()
    report = db.query(Report).filter(Report.tracking_number == clean_number).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with tracking number '{tracking_number}' was not found."
        )
    return report


@router.get("/reports/{report_id}", response_model=ReportOut)
def get_report_detail(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
