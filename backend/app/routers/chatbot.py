import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import User
from app.auth.dependencies import get_optional_current_user
from app.schemas.dtos import ChatRequest, ChatResponse
from app.services.chatbot_service import handle_chat_message
from typing import Optional

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

VALID_PORTALS = {"citizen", "hei", "industry", "govt"}


@router.post("/message", response_model=ChatResponse)
def send_chat_message(
    chat_in: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Stateless chat turn: the frontend sends the full message history each time.
    Citizen portal gets a full agent (file / track / FAQ); other portals get FAQ/help only.
    """
    if not chat_in.messages:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="messages must not be empty.")
    if chat_in.messages[-1].role != "user":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Last message must be from the user.")

    portal = chat_in.portal if chat_in.portal in VALID_PORTALS else "citizen"
    messages = [{"role": m.role, "content": m.content} for m in chat_in.messages]

    result = handle_chat_message(db, messages, portal, current_user)
    return ChatResponse(
        reply=result["reply"],
        actions=result.get("actions", []),
        is_simulated=result.get("is_simulated", False),
    )
