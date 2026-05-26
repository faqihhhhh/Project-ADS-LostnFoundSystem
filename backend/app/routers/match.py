from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.repositories.item_match_repo import ItemMatchRepository
from app.repositories.item_repo import ItemRepository
from app.repositories.user_repo import UserRepository
from app.repositories.point_log_repo import PointLogRepository
from app.repositories.notification_repo import NotificationRepository
from app.services.match_service import MatchService
from app.services.notification_service import NotificationService
from app.models.item_match import MatchStatus
from app.models.user import User
from app.core.deps import get_current_admin, get_pagination_params

router = APIRouter(prefix="/matches", tags=["Matches"])

def get_service(db: Session = Depends(get_db)) -> MatchService:
    return MatchService(
        ItemMatchRepository(db),
        ItemRepository(db),
        UserRepository(db),
        PointLogRepository(db),
        NotificationService(NotificationRepository(db))
    )

class MatchOut(BaseModel):
    id: int
    found_item_id: int
    lost_item_id: int
    alasan_match: str
    status: MatchStatus
    catatan_admin: str | None
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[MatchOut])
def list_pending(
    service: MatchService = Depends(get_service), 
    current_user: User = Depends(get_current_admin), 
    pagination: dict = Depends(get_pagination_params)
    ):
    return service.get_pending(**pagination)

@router.patch("/{match_id}/confirm", response_model=MatchOut)
def confirm(
    match_id: int, 
    catatan: str = "", 
    service: MatchService = Depends(get_service), 
    current_user: User = Depends(get_current_admin)
    ):
    return service.confirm(match_id, catatan)

@router.patch("/{match_id}/reject", response_model=MatchOut)
def reject(
    match_id: int, 
    catatan: str = "", 
    service: MatchService = Depends(get_service), current_user: User = Depends(get_current_admin)
    ):
    return service.reject(match_id, catatan)