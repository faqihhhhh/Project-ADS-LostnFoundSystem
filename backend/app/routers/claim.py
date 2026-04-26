from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.repositories.claim_repo import ClaimRepository
from app.repositories.item_repo import ItemRepository
from app.repositories.user_repo import UserRepository
from app.repositories.point_log_repo import PointLogRepository
from app.repositories.notification_repo import NotificationRepository
from app.services.claim_service import ClaimService
from app.services.notification_service import NotificationService
from app.models.user import User
from app.schemas.claim import ClaimCreate, ClaimOut
from app.core.deps import get_current_mahasiswa, get_current_admin

router = APIRouter(prefix="/claims", tags=["Claims"])

def get_service(db: Session = Depends(get_db)) -> ClaimService:
    return ClaimService(
        ClaimRepository(db),
        ItemRepository(db),
        UserRepository(db),
        PointLogRepository(db),
        NotificationService(NotificationRepository(db))
    )

# ── Khusus Mahasiswa ──────────────────────────────────────────────────
@router.post("", response_model=ClaimOut)
def ajukan(
    payload: ClaimCreate,
    service: ClaimService = Depends(get_service),
    current_user: User = Depends(get_current_mahasiswa)   # ← mahasiswa only
):
    return service.ajukan(payload, current_user)

@router.post("/{claim_id}/bukti", response_model=ClaimOut)
def upload_bukti(
    claim_id: int,
    file: UploadFile = File(...),
    service: ClaimService = Depends(get_service),
    current_user: User = Depends(get_current_mahasiswa)   # ← mahasiswa only
):
    return service.upload_bukti(claim_id, file, current_user)

@router.get("/me", response_model=List[ClaimOut])
def klaim_saya(
    service: ClaimService = Depends(get_service),
    current_user: User = Depends(get_current_mahasiswa)   # ← mahasiswa only
):
    return service.claim_repo.get_by_user(current_user.id)

# ── Khusus Admin ──────────────────────────────────────────────────────
@router.get("", response_model=List[ClaimOut])
def semua_klaim(
    service: ClaimService = Depends(get_service),
    current_user: User = Depends(get_current_admin)       # ← admin only
):
    return service.claim_repo.get_all()

@router.patch("/{claim_id}/approve", response_model=ClaimOut)
def approve(
    claim_id: int,
    catatan: str = "",
    service: ClaimService = Depends(get_service),
    current_user: User = Depends(get_current_admin)       # ← admin only
):
    return service.approve(claim_id, catatan)

@router.patch("/{claim_id}/reject", response_model=ClaimOut)
def reject(
    claim_id: int,
    catatan: str = "",
    service: ClaimService = Depends(get_service),
    current_user: User = Depends(get_current_admin)       # ← admin only
):
    return service.reject(claim_id, catatan)