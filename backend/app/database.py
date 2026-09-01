import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

# Format Render PostgreSQL URL if provided as postgres:// (SQLAlchemy requires postgresql://)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Handle SSL mode for Render managed PostgreSQL external URLs
connect_args = {}
if "render.com" in db_url or "sslmode=require" in db_url:
    connect_args["sslmode"] = "require"

# Test connection or fallback to local SQLite for offline/local development
try:
    if "postgresql" in db_url:
        temp_engine = create_engine(
            db_url,
            pool_pre_ping=True,
            connect_args=connect_args,
        )
        with temp_engine.connect() as conn:
            conn.execute(text("SELECT 1;"))
        engine = temp_engine
        logger.info("Connected to remote PostgreSQL instance.")
    else:
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
except Exception as e:
    logger.warning(f"Remote PostgreSQL unavailable ({e}). Falling back to local SQLite database.")
    db_url = "sqlite:///./samadhan_setu.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Attempt to enable extensions if permissions allow, then create tables and seed demo data."""
    try:
        if "postgresql" in str(engine.url):
            with engine.connect() as conn:
                try:
                    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                    conn.commit()
                except Exception as e:
                    logger.warning(f"Note on pgvector extension: {e}")
                
                try:
                    conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                    conn.commit()
                except Exception as e:
                    logger.warning(f"Note on postgis extension: {e}")
                    
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error during init_db: {e}")
        raise e
