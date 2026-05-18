from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel
from app.database import get_db
from app.repositories.notification_repo import NotificationRepository
from app.services.notification_service import NotificationService
from app.models.notification import Notification
from app.models.user import User
from app.core.deps import get_current_user, get_pagination_params

router = APIRouter(prefix="/notifications", tags=["Notifications"])

def get_service(db: Session = Depends(get_db)) -> NotificationService:
    return NotificationService(NotificationRepository(db))

class NotifOut(BaseModel):
    id: int
    judul: str
    pesan: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[NotifOut])
def get_notifikasi(
    service: NotificationService = Depends(get_service), 
    current_user: User = Depends(get_current_user),
    pagination: dict = Depends(get_pagination_params)
    ):
    return service.get_milik_saya(current_user.id, **pagination)

@router.patch("/read")
def tandai_dibaca(service: NotificationService = Depends(get_service), current_user: User = Depends(get_current_user)):
    service.tandai_sudah_dibaca(current_user.id)
    return {"message": "Semua notifikasi ditandai sudah dibaca"}