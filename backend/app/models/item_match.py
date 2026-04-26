from sqlalchemy import Column, Integer, String, Enum, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class MatchStatus(str, enum.Enum):
    pending  = "PENDING"    # menunggu validasi admin
    confirmed = "CONFIRMED" # admin konfirmasi cocok
    rejected  = "REJECTED"  # admin tolak

class ItemMatch(Base):
    __tablename__ = "item_matches"

    id            = Column(Integer, primary_key=True, index=True)
    found_item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    lost_item_id  = Column(Integer, ForeignKey("items.id"), nullable=False)

    # Alasan sistem mendeteksi kecocokan
    # cth: "Kategori sama: dompet | Lokasi berdekatan: Gedung FEM"
    alasan_match  = Column(Text, nullable=False)

    status        = Column(Enum(MatchStatus), default=MatchStatus.pending)
    catatan_admin = Column(Text, nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    found_item = relationship("Item", foreign_keys=[found_item_id], back_populates="matches_as_found")
    lost_item  = relationship("Item", foreign_keys=[lost_item_id],  back_populates="matches_as_lost")