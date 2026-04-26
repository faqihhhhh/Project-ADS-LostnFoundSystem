from pydantic import BaseModel, model_validator
from datetime import datetime
from typing import Optional, List
from app.models.item import ItemType, ItemStatus, ItemCategory

class ItemFotoOut(BaseModel):
    id: int
    url: str

    class Config:
        from_attributes = True

class ItemCreate(BaseModel):
    tipe: ItemType
    kategori: ItemCategory
    nama_publik: str                            # nama generik — wajib
    deskripsi_detail: Optional[str] = None      # detail hanya untuk admin

    # FOUND
    lokasi_ditemukan: Optional[str] = None
    lokasi_sekarang: Optional[str] = None

    # LOST
    lokasi_kemungkinan: Optional[List[str]] = None

    tanggal: datetime

    @model_validator(mode="after")
    def validasi_field_per_tipe(self):
        if self.tipe == ItemType.found:
            if not self.lokasi_ditemukan:
                raise ValueError("lokasi_ditemukan wajib diisi untuk barang temuan")
            if not self.lokasi_sekarang:
                raise ValueError("lokasi_sekarang wajib diisi untuk barang temuan")
        if self.tipe == ItemType.lost:
            if not self.lokasi_kemungkinan:
                raise ValueError("lokasi_kemungkinan wajib diisi untuk barang hilang")
        return self

# Response lengkap — untuk pemilik/penemu dan admin
class ItemOut(BaseModel):
    id: int
    user_id: int
    tipe: ItemType
    status: ItemStatus
    kategori: ItemCategory
    nama_publik: str
    deskripsi_detail: Optional[str] = None
    lokasi_ditemukan: Optional[str] = None
    lokasi_sekarang: Optional[str] = None
    lokasi_kemungkinan: Optional[List[str]] = None
    bukti_kepemilikan: Optional[List[str]] = None
    tanggal: datetime
    expired_at: Optional[datetime] = None
    created_at: datetime
    foto: List[ItemFotoOut] = []

    class Config:
        from_attributes = True

# Response publik — untuk mahasiswa lain dan guest
# Sengaja disembunyikan: deskripsi_detail, lokasi_sekarang, bukti_kepemilikan
class ItemOutPublik(BaseModel):
    id: int
    tipe: ItemType
    status: ItemStatus
    kategori: ItemCategory
    nama_publik: str                            # hanya nama universal
    lokasi_ditemukan: Optional[str] = None      # FOUND: tempat ditemukan saja
    lokasi_kemungkinan: Optional[List[str]] = None  # LOST: area kemungkinan
    tanggal: datetime
    foto: List[ItemFotoOut] = []                # foto FOUND disembunyikan untuk guest

    class Config:
        from_attributes = True