import os
import uuid
import logging
from typing import Optional, Tuple
import boto3
from botocore.config import Config
from app.config import settings

logger = logging.getLogger(__name__)

# Check if S3 credentials are provided
_S3_ENABLED = bool(
    settings.S3_ACCESS_KEY_ID and 
    settings.S3_SECRET_ACCESS_KEY and 
    settings.S3_BUCKET_NAME
)

_s3_client = None
if _S3_ENABLED:
    try:
        _s3_client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.S3_ACCESS_KEY_ID,
            aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
            region_name=settings.S3_REGION_NAME or "auto",
            config=Config(signature_version="s3v4")
        )
        logger.info(f"S3/R2 Storage client initialized for bucket: {settings.S3_BUCKET_NAME}")
    except Exception as e:
        logger.error(f"Failed to initialize S3 client: {e}")
        _S3_ENABLED = False

def upload_file_bytes(file_bytes: bytes, filename: str, content_type: str) -> str:
    """
    Uploads file to S3/R2 bucket or stores locally if credentials not supplied.
    Returns: The public accessible URL of the file.
    """
    ext = os.path.splitext(filename)[1] or ".jpg"
    unique_key = f"uploads/{uuid.uuid4().hex}{ext}"

    if _S3_ENABLED and _s3_client:
        try:
            _s3_client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=unique_key,
                Body=file_bytes,
                ContentType=content_type,
                ACL="public-read"
            )
            if settings.S3_PUBLIC_BASE_URL:
                return f"{settings.S3_PUBLIC_BASE_URL.rstrip('/')}/{unique_key}"
            elif settings.S3_ENDPOINT_URL:
                return f"{settings.S3_ENDPOINT_URL.rstrip('/')}/{settings.S3_BUCKET_NAME}/{unique_key}"
            else:
                return f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com/{unique_key}"
        except Exception as e:
            logger.error(f"S3 upload error: {e}. Falling back to local storage.")

    # Local fallback for media uploads
    local_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static_uploads")
    os.makedirs(local_dir, exist_ok=True)
    local_file_path = os.path.join(local_dir, f"{uuid.uuid4().hex}{ext}")
    with open(local_file_path, "wb") as f:
        f.write(file_bytes)
    
    # Return endpoint path relative to backend
    file_rel_name = os.path.basename(local_file_path)
    return f"/api/media/files/{file_rel_name}"
