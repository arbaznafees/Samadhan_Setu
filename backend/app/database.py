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

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Attempt to enable extensions if permissions allow, then create tables."""
    try:
        with engine.connect() as conn:
            # Check or attempt creating postgis and vector extensions
            try:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
                logger.info("Successfully ensured pgvector extension is enabled.")
            except Exception as e:
                logger.warning(f"Note on pgvector extension: {e}. If on Render, ensure 'CREATE EXTENSION vector;' has been run manually.")
            
            try:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                conn.commit()
                logger.info("Successfully ensured postgis extension is enabled.")
            except Exception as e:
                logger.warning(f"Note on postgis extension: {e}. If on Render, ensure 'CREATE EXTENSION postgis;' has been run manually.")
                
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error during init_db: {e}")
        # Re-raise so startup fails visibly with the exact DB connection issue
        raise e
