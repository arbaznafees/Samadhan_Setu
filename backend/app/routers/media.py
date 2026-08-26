import os
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from app.services.s3_service import upload_file_bytes

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/media", tags=["Media Upload"])

@router.post("/upload")
async def upload_media_file(file: UploadFile = File(...)):
    """Uploads a photo or video evidence file to S3/R2 or local fallback storage."""
    try:
        contents = await file.read()
        if len(contents) > 25 * 1024 * 1024:  # 25MB max
            raise HTTPException(status_code=400, detail="File exceeds maximum allowable size (25MB)")
        
        content_type = file.content_type or "application/octet-stream"
        url = upload_file_bytes(contents, file.filename or "upload.jpg", content_type)
        return {"url": url, "filename": file.filename, "content_type": content_type}
    except Exception as e:
        logger.error(f"Error uploading media file: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/files/{filename}")
def serve_local_file(filename: str):
    """Serves locally stored uploads when S3 is in local development fallback."""
    local_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static_uploads")
    file_path = os.path.join(local_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)
