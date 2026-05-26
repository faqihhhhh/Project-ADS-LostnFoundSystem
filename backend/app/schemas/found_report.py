from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.found_report import FoundReportStatus
from app.models.item import IPBLocation

class FoundReportCreate(BaseModel):
    lost_item_id: int
    deskripsi: str
    lokasi_sekarang: IPBLocation

class FoundReportOut(BaseModel):
    id: int
    lost_item_id: int
    lost_item_nama: Optional[str] = None
    reporter_id: int
    reporter_nama: Optional[str] = None
    deskripsi: str
    lokasi_sekarang: IPBLocation
    foto_bukti: List[str] = []
    status: FoundReportStatus
    catatan_admin: Optional[str] = None
    kode_pengambilan: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True