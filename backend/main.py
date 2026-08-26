import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routers import auth, citizen, hei, industry, govt, media, notifications, health

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("samadhan_setu")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up Samadhan Setu Jharkhand Backend...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization warning/error: {e}")
    yield
    logger.info("Shutting down Samadhan Setu Jharkhand Backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Full-stack AI-powered civic grievance to institutional research & CSR funding resolution platform for Jharkhand.",
    lifespan=lifespan
)

# CORS Middleware with Vercel frontend domain support
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(citizen.router, prefix="/api")
app.include_router(hei.router, prefix="/api")
app.include_router(industry.router, prefix="/api")
app.include_router(govt.router, prefix="/api")
app.include_router(media.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Welcome to Samadhan Setu Jharkhand API",
        "docs_url": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", settings.PORT))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
