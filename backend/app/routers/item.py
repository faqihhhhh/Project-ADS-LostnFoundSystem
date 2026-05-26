from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.repositories.item_repo import ItemRepository
from app.repositories.item_match_repo import ItemMatchRepository
from app.repositories.user_repo import UserRepository
from app.repositories.point_log_repo import PointLogRepository
from app.repositories.notification_repo import NotificationRepository
from app.services.item_service import ItemService
from app.services.match_service import MatchService
from app.services.notification_service import NotificationService
from app.models.item import ItemType, ItemCategory, ItemStatus, TimePeriod, ItemLocation
from app.models.user import User, UserRole
from app.schemas.item import ItemCreate, ItemOut, ItemOutPublik
from app.core.deps import get_current_mahasiswa, get_current_admin, get_optional_user, get_pagination_params

router = APIRouter(prefix="/items", tags=["Items"])

def get_item_service(db: Session = Depends(get_db)) -> ItemService:
    return ItemService(ItemRepository(db))

def get_match_service(db: Session = Depends(get_db)) -> MatchService:
    return MatchService(
        ItemMatchRepository(db),
        ItemRepository(db),
        UserRepository(db),
        PointLogRepository(db),
        NotificationService(NotificationRepository(db))
    )

# ── 1. LIST BARANG (UMUM) ─────────────────────────────────────────────
@router.get("", response_model=List[ItemOutPublik])
def list_barang(
    tipe: Optional[ItemType] = Query(None),
    kategori: Optional[ItemCategory] = Query(None),
    lokasi: Optional[ItemLocation] = Query(None),
    status: Optional[ItemStatus] = Query(None),
    q: Optional[str] = Query(None),
    period: Optional[TimePeriod] = Query(None),
    service: ItemService = Depends(get_item_service),
    current_user: Optional[User] = Depends(get_optional_user),
    pagination: dict = Depends(get_pagination_params)
):
    return service.get_all(
        tipe=tipe, 
        kategori=kategori, 
        lokasi=lokasi,
        status=status, 
        q=q, 
        current_user=current_user, 
        period=period,
        **pagination
    )

# ── 2. ADMIN: LIST SEMUA (HARUS DI ATAS {item_id}) ─────────────────────
# Karena jalurnya statis (/admin/all), diletakkan sebelum jalur dinamis
@router.get("/admin/all", response_model=List[ItemOut])
def list_semua_admin(
    tipe: Optional[ItemType] = Query(None),
    kategori: Optional[ItemCategory] = Query(None),
    lokasi: Optional[ItemLocation] = Query(None),
    status: Optional[ItemStatus] = Query(None),
    q: Optional[str] = Query(None),
    period: Optional[TimePeriod] = Query(None),
    service: ItemService = Depends(get_item_service),
    current_user: User = Depends(get_current_admin),
    pagination: dict = Depends(get_pagination_params)
):
    return service.get_all_for_admin(
        tipe=tipe,
        kategori=kategori,
        lokasi=lokasi,
        status=status,
        q=q,
        period=period,
        **pagination
    )

# ── 3. DETAIL BARANG (DINAMIS) ────────────────────────────────────────
# Jalur ini menggunakan variabel {item_id}, maka ditaruh di paling bawah kategori GET
@router.get("/{item_id}")
def detail_barang(
    item_id: int,
    service: ItemService = Depends(get_item_service),
    current_user: Optional[User] = Depends(get_optional_user)
):
    item = service.get_detail(item_id, current_user)
    
    # Cek akses: Admin dan Pemilik bisa lihat full (ItemOut)
    is_admin = current_user and current_user.role == UserRole.admin
    is_owner = current_user and current_user.id == item.user_id
    
    if is_admin or is_owner:
        return ItemOut.model_validate(item)
        
    # User lain hanya bisa lihat info publik
    return ItemOutPublik.model_validate(item)

# ── 4. AKSI MAHASISWA (POST) ──────────────────────────────────────────
@router.post("", response_model=ItemOut)
def lapor(
    payload: ItemCreate,
    service: ItemService = Depends(get_item_service),
    match_service: MatchService = Depends(get_match_service),
    current_user: User = Depends(get_current_mahasiswa)
):
    item = service.lapor(payload, current_user)
    match_service.auto_detect(item)
    return item

@router.post("/{item_id}/foto", response_model=ItemOut)
def upload_foto(
    item_id: int,
    file: UploadFile = File(...),
    service: ItemService = Depends(get_item_service),
    current_user: User = Depends(get_current_mahasiswa)
):
    return service.upload_foto(item_id, file, current_user)

@router.post("/{item_id}/bukti-kepemilikan", response_model=ItemOut)
def upload_bukti_kepemilikan(
    item_id: int,
    file: UploadFile = File(...),
    service: ItemService = Depends(get_item_service),
    current_user: User = Depends(get_current_mahasiswa)
):
    return service.upload_bukti_kepemilikan(item_id, file, current_user)

# ── 5. AKSI ADMIN (DELETE) ────────────────────────────────────────────
@router.delete("/{item_id}")
def hapus(
    item_id: int,
    service: ItemService = Depends(get_item_service),
    current_user: User = Depends(get_current_admin)
):
    service.hapus(item_id, current_user)
    return {"message": "Barang berhasil dihapus"}