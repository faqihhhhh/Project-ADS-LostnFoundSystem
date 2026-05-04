from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    mahasiswa = "mahasiswa"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id       = Column(Integer, primary_key=True, index=True)
    username   = Column(String, unique=True, index=True, nullable=False)
    nim      = Column(String, unique=True, index=True, nullable=True)
    nama     = Column(String, nullable=False)
    email    = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)          # disimpan sudah di-hash
    role     = Column(Enum(UserRole), default=UserRole.mahasiswa)
    is_active = Column(Boolean, default=True)
    poin     = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items  = relationship("Item", back_populates="user")
    claims = relationship("Claim", back_populates="user")
    point_logs = relationship("PointLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user")