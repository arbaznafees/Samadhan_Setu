import logging
from celery_app import celery_worker
from app.database import SessionLocal
from app.models.entities import Report, HEI, Notification, AuditLog, User
from app.services.gemini_service import classify_and_summarize_report, get_text_embedding
from app.services.dedup_service import check_duplicate_report
from app.services.matching_engine import match_report_to_hei

logger = logging.getLogger(__name__)

def process_report_pipeline_sync(report_id: int):
    """
    Core AI Triage, Embedding, Deduplication, and HEI Matching pipeline.
    Executable both synchronously and via Celery async worker.
    """
    db = SessionLocal()
    try:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            logger.error(f"Report ID {report_id} not found in database.")
            return False

        logger.info(f"--- Starting Triage Pipeline for Report #{report.id} ({report.tracking_number}) ---")

        # 1. Gemini AI Classification & Multilingual summarization
        ai_res = classify_and_summarize_report(report.title, report.description)
        report.domain = ai_res.get("domain", report.domain or "General")
        report.category = ai_res.get("category", report.category or "Grievance")
        report.priority = ai_res.get("priority", report.priority or "Medium")
        report.language = ai_res.get("language", "English")
        report.ai_summary = ai_res.get("ai_summary", report.description[:200])
        report.is_ai_simulated = ai_res.get("is_simulated", False)

        # 2. Embedding Generation (768-dim)
        text_for_embedding = f"{report.title}. {report.description}. Domain: {report.domain}. Category: {report.category}"
        embedding_vec = get_text_embedding(text_for_embedding)
        report.embedding = embedding_vec

        # 3. Duplicate Detection via pgvector
        is_dup, dup_of_id, dup_similarity = check_duplicate_report(db, embedding_vec, current_report_id=report.id)
        report.is_duplicate = is_dup
        report.duplicate_of_id = dup_of_id
        report.duplicate_similarity = dup_similarity

        # 4. Rules-based HEI Matching
        assigned_hei_id, match_score, match_reasons = match_report_to_hei(
            db, report, ai_keywords=ai_res.get("key_keywords", [])
        )
        report.assigned_hei_id = assigned_hei_id
        report.hei_match_score = match_score
        report.hei_match_reasons = match_reasons
        
        # Update status
        if assigned_hei_id:
            report.status = "HEI_Assigned"
            # Increment active projects count on HEI
            matched_hei = db.query(HEI).filter(HEI.id == assigned_hei_id).first()
            if matched_hei:
                matched_hei.active_projects_count = (matched_hei.active_projects_count or 0) + 1
        else:
            report.status = "Triaged"

        # 5. Create in-app Notifications
        # Notification to citizen
        if report.citizen_id:
            citizen_notif = Notification(
                user_id=report.citizen_id,
                role_target="citizen",
                title="Grievance Triaged & Assigned",
                message=f"Your grievance '{report.title[:40]}' has been routed to institutional partner for research and resolution.",
                link=f"/citizen?track={report.tracking_number}"
            )
            db.add(citizen_notif)

        # Notification to assigned HEI
        if assigned_hei_id:
            hei_user = db.query(HEI).filter(HEI.id == assigned_hei_id).first()
            if hei_user and hei_user.user_id:
                hei_notif = Notification(
                    user_id=hei_user.user_id,
                    role_target="hei_reviewer",
                    title="New Problem Statement Assigned",
                    message=f"Grievance '{report.title[:40]}' ({report.domain}) assigned to your institution (Match: {match_score:.0f}%).",
                    link="/hei"
                )
                db.add(hei_notif)

        # 6. Create Audit Log
        audit = AuditLog(
            report_id=report.id,
            action="AI_TRIAGE_AND_HEI_MATCH",
            actor_name="Gemini Triage & Rules Engine",
            actor_role="system",
            details={
                "domain": report.domain,
                "category": report.category,
                "priority": report.priority,
                "is_duplicate": report.is_duplicate,
                "duplicate_similarity": report.duplicate_similarity,
                "assigned_hei_id": report.assigned_hei_id,
                "hei_match_score": report.hei_match_score,
                "is_ai_simulated": report.is_ai_simulated
            }
        )
        db.add(audit)

        db.commit()
        logger.info(f"Pipeline successfully finished for Report #{report.id} -> HEI #{assigned_hei_id}")
        return True

    except Exception as e:
        logger.error(f"Error in process_report_pipeline for report {report_id}: {e}")
        db.rollback()
        return False
    finally:
        db.close()


@celery_worker.task(name="app.celery_tasks.triage_and_process_report_task")
def triage_and_process_report_task(report_id: int):
    """Celery background task for async AI triage and matching."""
    logger.info(f"[Celery Task] Running triage for report #{report_id}")
    return process_report_pipeline_sync(report_id)
