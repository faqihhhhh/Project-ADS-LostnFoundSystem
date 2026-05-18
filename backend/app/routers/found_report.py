from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.repositories.found_report_repo import FoundReportRepository
from app.repositories.item_repo import ItemRepository
from app.repositories.user_repo import UserRepository
from app.repositories.point_log_repo import PointLogRepository
from app.repositories.notification_repo import NotificationRepository
from app.services.found_report_service import FoundReportService
from app.services.notification_service import NotificationService
from app.models.user import User
from app.schemas.found_report import FoundReportCreate, FoundReportOut
from app.core.deps import get_current_mahasiswa, get_current_admin, get_pagination_params
from fastapi import HTTPException

router = APIRouter(prefix="/found-reports", tags=["Found Reports"])

def get_service(db: Session = Depends(get_db)) -> FoundReportService:
    return FoundReportService(
        FoundReportRepository(db),
        ItemRepository(db),
        UserRepository(db),
        PointLogRepository(db),
        NotificationService(NotificationRepository(db))
    )

# ── Khusus Mahasiswa ──────────────────────────────────────────────────
@router.post("", response_model=FoundReportOut)
def ajukan(
    payload: FoundReportCreate,
    service: FoundReportService = Depends(get_service),
    current_user: User = Depends(get_current_mahasiswa)
):
    return service.ajukan(payload, current_user)

@router.post("/{report_id}/foto", response_model=FoundReportOut)
def upload_foto(
    report_id: int,
    file: UploadFile = File(...),
    service: FoundReportService = Depends(get_service),
    current_user: User = Depends(get_current_mahasiswa)
):
    return service.upload_foto(report_id, file, current_user)

@router.get("/me", response_model=List[FoundReportOut])
def laporan_saya(
    service: FoundReportService = Depends(get_service),
    current_user: User = Depends(get_current_mahasiswa),
    pagination: dict = Depends(get_pagination_params)
):
    return service.report_repo.get_by_reporter(current_user.id, **pagination)

# ── Khusus Admin ──────────────────────────────────────────────────────
@router.get("", response_model=List[FoundReportOut])
def semua_laporan_pending(
    service: FoundReportService = Depends(get_service),
    current_user: User = Depends(get_current_admin),
    pagination: dict = Depends(get_pagination_params)
):
    return service.report_repo.get_all_pending(**pagination)

@router.get("/{report_id}/kode")
def lihat_kode(
    report_id: int,
    service: FoundReportService = Depends(get_service),
    current_user: User = Depends(get_current_admin)
):
    report = service.report_repo.get_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
    return {
        "report_id": report.id,
        "nama_barang": report.lost_item.nama_publik,
        "kode_pengambilan": report.kode_pengambilan,
        "status": report.status
    }

@router.patch("/{report_id}/approve", response_model=FoundReportOut)
def approve(
    report_id: int,
    catatan: str = "",
    service: FoundReportService = Depends(get_service),
    current_user: User = Depends(get_current_admin)
):
    return service.approve(report_id, catatan)

@router.patch("/{report_id}/reject", response_model=FoundReportOut)
def reject(
    report_id: int,
    catatan: str = "",
    service: FoundReportService = Depends(get_service),
    current_user: User = Depends(get_current_admin)
):
    return service.reject(report_id, catatan)