from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.found_report import FoundReportStatus

class FoundReportCreate(BaseModel):
    lost_item_id: int
    deskripsi: str
    lokasi_sekarang: str

class FoundReportOut(BaseModel):
    id: int
    lost_item_id: int
    reporter_id: int
    deskripsi: str
    lokasi_sekarang: str
    foto_bukti: List[str] = []
    status: FoundReportStatus
    catatan_admin: Optional[str] = None
    kode_pengambilan: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True