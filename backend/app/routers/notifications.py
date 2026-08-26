from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.entities import Notification, User
from app.schemas.dtos import NotificationOut
from app.auth.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationOut])
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get notifications targeted specifically to this user or their role.
    """
    notifs = db.query(Notification).filter(
        or_(
            Notification.user_id == current_user.id,
            Notification.role_target == current_user.role,
            Notification.role_target == "all"
        )
    ).order_by(Notification.created_at.desc()).limit(30).all()
    return notifs


@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}
