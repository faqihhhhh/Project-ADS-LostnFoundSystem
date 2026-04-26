from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.repositories.user_repo import UserRepository
from app.repositories.point_log_repo import PointLogRepository
from app.services.leaderboard_service import LeaderboardService
from app.models.user import User
from app.schemas.leaderboard import LeaderboardResponse, PointLogOut
from app.core.deps import get_optional_user, get_current_mahasiswa

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

def get_service(db: Session = Depends(get_db)) -> LeaderboardService:
    return LeaderboardService(UserRepository(db), PointLogRepository(db))

# Siapapun bisa lihat leaderboard
@router.get("", response_model=LeaderboardResponse)
def get_leaderboard(
    service: LeaderboardService = Depends(get_service),
    current_user: Optional[User] = Depends(get_optional_user)
):
    return service.get_leaderboard(current_user)

# Riwayat poin hanya untuk mahasiswa
@router.get("/me/riwayat", response_model=List[PointLogOut])
def riwayat(
    service: LeaderboardService = Depends(get_service),
    current_user: User = Depends(get_current_mahasiswa)   # ← mahasiswa only
):
    return service.get_riwayat(current_user.id)