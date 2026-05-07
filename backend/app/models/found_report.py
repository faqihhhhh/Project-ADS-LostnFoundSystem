from sqlalchemy import Column, Integer, String, Enum, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ARRAY
import enum
from app.database import Base

class FoundReportStatus(str, enum.Enum):
    pending  = "PENDING"
    approved = "APPROVED"
    rejected = "REJECTED"

class FoundReport(Base):
    __tablename__ = "found_reports"

    id              = Column(Integer, primary_key=True, index=True)
    lost_item_id    = Column(Integer, ForeignKey("items.id"), nullable=False)
    reporter_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    deskripsi       = Column(Text, nullable=False)
    lokasi_sekarang = Column(String, nullable=False)   # barang ada di mana sekarang
    foto_bukti      = Column(ARRAY(String), default=[])
    status          = Column(Enum(FoundReportStatus), default=FoundReportStatus.pending)
    catatan_admin   = Column(Text, nullable=True)
    kode_pengambilan = Column(String, nullable=True)   # digenerate saat approved
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    lost_item = relationship("Item", foreign_keys=[lost_item_id])
    reporter  = relationship("User", foreign_keys=[reporter_id])