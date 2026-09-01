import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.config import settings

router = APIRouter(tags=["Health & Pre-warming"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Health check and pre-warming endpoint for Render free-tier instances.
    Pinging this endpoint wakes up PostgreSQL and the FastAPI application.
    """
    db_status = "connected"
    pgvector_status = "unknown"
    try:
        res = db.execute(text("SELECT 1")).scalar()
        if res == 1:
            db_status = "connected"
        
        # Test vector extension
        try:
            db.execute(text("SELECT '[1,2,3]'::vector;"))
            pgvector_status = "enabled"
        except Exception:
            pgvector_status = "not_enabled_or_manual_required"
    except Exception as e:
        db_status = f"error: {str(e)}"

    is_gemini_live = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip())

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "database": db_status,
        "pgvector_extension": pgvector_status,
        "gemini_ai_mode": "LIVE_API" if is_gemini_live else "SIMULATION_MODE",
        "timestamp": time.time(),
        "prewarm_message": "Service is warm and ready for live evaluations."
    }
