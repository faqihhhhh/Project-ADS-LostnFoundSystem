from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.claim import ClaimStatus

class ClaimCreate(BaseModel):
    item_id: int
    deskripsi_ciri: str      # ciri khusus yang tidak terlihat di foto

class ClaimOut(BaseModel):
    id: int
    item_id: int
    user_id: int
    status: ClaimStatus
    deskripsi_ciri: str
    bukti_foto: List[str] = []
    created_at: datetime
    catatan_admin: Optional[str] = None
    kode_pengambilan: Optional[str] = None

    class Config:
        from_attributes = True