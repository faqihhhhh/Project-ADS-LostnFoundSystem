from pydantic import BaseModel, model_validator
from datetime import datetime
from typing import Optional, List

from sqlalchemy import Enum
from app.models.item import ItemType, ItemStatus, ItemCategory, ItemLocation, IPBLocation

class ItemFotoOut(BaseModel):
    id: int
    url: str
    class Config:
        from_attributes = True

# Request untuk membuat laporan (FOUND / LOST)
class ItemCreate(BaseModel):
    tipe: ItemType
    kategori: ItemCategory
    nama_publik: str
    deskripsi_detail: Optional[str] = None
    
    # Lokasi untuk FOUND
    lokasi_ditemukan_list: Optional[ItemLocation] = None
    lokasi_ditemukan: Optional[str] = None
    lokasi_sekarang: Optional[IPBLocation] = None
    
    # Lokasi untuk LOST (Multi-lokasi)
    lokasi_kemungkinan_list: Optional[List[ItemLocation]] = []
    lokasi_kemungkinan: Optional[List[str]] = []
    
    tanggal: datetime

# Response lengkap — untuk pemilik/penemu dan admin
class ItemOut(BaseModel):
    id: int
    user_id: int
    user_nama: Optional[str] = None
    user_nim: Optional[str] = None
    tipe: ItemType
    status: ItemStatus
    kategori: ItemCategory
    nama_publik: str
    deskripsi_detail: Optional[str] = None
    lokasi_ditemukan_list: Optional[ItemLocation] = None
    lokasi_ditemukan: Optional[str] = None
    lokasi_sekarang: Optional[IPBLocation] = None
    lokasi_kemungkinan_list: Optional[List[ItemLocation]] = None
    lokasi_kemungkinan: Optional[List[str]] = None
    tanggal: datetime
    expired_at: Optional[datetime] = None       # untuk info kadaluarsa
    foto: List[ItemFotoOut] = []                # foto FOUND disembunyikan untuk guest

    class Config:
        from_attributes = True

# Response publik — untuk pencarian di katalog
class ItemOutPublik(BaseModel):
    id: int
    user_id: int
    tipe: ItemType
    status: ItemStatus
    kategori: ItemCategory
    nama_publik: str
    lokasi_ditemukan_list: Optional[ItemLocation] = None
    lokasi_ditemukan: Optional[str] = None
    lokasi_kemungkinan_list: Optional[List[ItemLocation]] = None
    lokasi_kemungkinan: Optional[List[str]] = None
    tanggal: datetime
    expired_at: Optional[datetime] = None
    foto: List[ItemFotoOut] = []

    class Config:
        from_attributes = True
