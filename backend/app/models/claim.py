from sqlalchemy import Column, Integer, String, Enum, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ARRAY
import enum
from app.database import Base

class ClaimStatus(str, enum.Enum):
    pending  = "PENDING"
    approved = "APPROVED"
    rejected = "REJECTED"

class Claim(Base):
    __tablename__ = "claims"

    id              = Column(Integer, primary_key=True, index=True)
    item_id         = Column(Integer, ForeignKey("items.id"), nullable=False)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    status          = Column(Enum(ClaimStatus), default=ClaimStatus.pending)
    deskripsi_ciri  = Column(Text, nullable=False)
    bukti_foto      = Column(ARRAY(String), default=[])   # list url foto bukti
    catatan_admin   = Column(Text, nullable=True)         # alasan approve/reject
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    item = relationship("Item", back_populates="claims")
    user = relationship("User", back_populates="claims")
    kode_pengambilan = Column(String, nullable=True)