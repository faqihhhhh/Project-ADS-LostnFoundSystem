from pydantic import BaseModel
from typing import List, Optional

class PointLogOut(BaseModel):
    id: int
    jumlah: int
    alasan: str
    created_at: str

    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    peringkat: int
    user_id: int
    nama: str
    poin: int

class LeaderboardResponse(BaseModel):
    top10: List[LeaderboardEntry]
    poin_saya: Optional[int] = None
    peringkat_saya: Optional[int] = None