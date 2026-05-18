from sqlalchemy import Column, Integer, String, Enum, Text, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, timedelta
import enum
from app.database import Base

class ItemType(str, enum.Enum):
    lost  = "LOST"
    found = "FOUND"

class ItemStatus(str, enum.Enum):
    open     = "OPEN"
    pending  = "PENDING"
    closed   = "CLOSED"
    expired  = "EXPIRED"

class ItemCategory(str, enum.Enum):
    elektronik = "elektronik"
    dompet     = "dompet"
    kunci      = "kunci"
    kartu      = "kartu"
    pakaian    = "pakaian"
    tas        = "tas"
    botol      = "botol"
    lainnya    = "lainnya"

class TimePeriod(str, enum.Enum):
    today      = "today"
    this_week  = "this_week"
    this_month = "this_month"
    all_time   = "all_time"


class ItemLocation(str, Enum):
    # Gedung Perkuliahan & Fasilitas Umum
    CCR = "Common Class Room (CCR)"
    GKB = "Gedung Kuliah Bersama (GKB)"
    PERPUSTAKAAN = "Perpustakaan Pusat"
    MASJID_AL_HURRIYYAH = "Masjid Al-Hurriyyah"
    GYMNASIUM = "Gymnasium"
    AUDITORIUM_AHMAD_ANDI = "Auditorium Andi Hakim Nasoetion"
    
    # Asrama
    ASRAMA_PUTRA = "Asrama Putra (Astra)"
    ASRAMA_PUTRI = "Asrama Putri (Astri)"
    
    # Kantin Favorit
    STEVIA = "Kantin Stevia"
    UNGU = "Kantin Ungu"
    BLUE_CORNER = "Blue Corner"
    YELLOW_CORNER = "Yellow Corner"
    NAYS = "Kantin Nays"
    RIMBAWAN = "Kantin Rimbawan"
    SAPTA = "Kantin Sapta"
    PLASMA = "Kantin Plasma"
    KANPAT = "Kantin Empat (Kanpat)"
    IBU_SAYANG = "Kantin Ibu Sayang"
    MAKJAN = "Kantin Makjan"
    
    # Fakultas
    FAPERTA = "Fakultas Pertanian (Faperta)"
    FKH = "Fakultas Kedokteran Hewan (FKH)"
    FPIK = "Fakultas Perikanan dan Ilmu Kelautan (FPIK)"
    FAPET = "Fakultas Peternakan (Fapet)"
    FAHUTAN = "Fakultas Kehutanan dan Lingkungan (Fahutan)"
    FATETA = "Fakultas Teknologi Pertanian (Fateta)"
    FMIPA = "Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)"
    FEM = "Fakultas Ekonomi dan Manajemen (FEM)"
    FEMA = "Fakultas Ekologi Manusia (FEMA)"
    SKHB = "Sekolah Kedokteran Hewan dan Biomedis (SKHB)"
    SB = "Sekolah Bisnis (SB)"
    SV = "Sekolah Vokasi (SV)"
    
    # Lain-lain
    HALTE_BUS = "Halte Bus / Lintas"
    JALANAN_KAMPUS = "Area Jalanan Kampus"
    LAINNYA = "Lainnya"



def default_expired_at():
    return datetime.utcnow() + timedelta(days=30)

class Item(Base):
    __tablename__ = "items"

    id                  = Column(Integer, primary_key=True, index=True)
    user_id             = Column(Integer, ForeignKey("users.id"), nullable=False)
    tipe                = Column(Enum(ItemType), nullable=False)
    status              = Column(Enum(ItemStatus), default=ItemStatus.open)
    kategori            = Column(Enum(ItemCategory), nullable=False)

    # Nama publik (universal) — yang ditampilkan ke semua user
    # cth: "Botol", "Dompet", "Kunci" — tidak boleh terlalu spesifik
    nama_publik         = Column(String, nullable=False)

    # Deskripsi detail — hanya terlihat oleh admin dan pemilik/penemu
    deskripsi_detail    = Column(Text, nullable=True)

    # Field khusus FOUND
    # Tempat barang ditemukan
    lokasi_ditemukan    = Column(String, nullable=True)
    # Tempat barang disimpan sekarang (misal: pos satpam FEM)
    lokasi_sekarang     = Column(String, nullable=True)

    lokasi_ditemukan_list = Column(Enum(ItemLocation), nullable=True)
    lokasi_kemungkinan_list = Column(ARRAY(Enum(ItemLocation)), nullable=True)

    # Field khusus LOST
    # Bisa beberapa tempat kemungkinan hilang
    lokasi_kemungkinan  = Column(ARRAY(String), nullable=True)
    # Foto bukti kepemilikan (khusus LOST)
    bukti_kepemilikan   = Column(ARRAY(String), nullable=True)

    tanggal             = Column(DateTime(timezone=True), nullable=False)
    expired_at          = Column(DateTime(timezone=True), default=default_expired_at)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())

    user   = relationship("User", back_populates="items")
    foto   = relationship("ItemFoto", back_populates="item", cascade="all, delete")
    claims = relationship("Claim", back_populates="item", cascade="all, delete")
    matches_as_found = relationship("ItemMatch", foreign_keys="ItemMatch.found_item_id", back_populates="found_item", cascade="all, delete")
    matches_as_lost  = relationship("ItemMatch", foreign_keys="ItemMatch.lost_item_id",  back_populates="lost_item",  cascade="all, delete")

class ItemFoto(Base):
    __tablename__ = "item_foto"

    id         = Column(Integer, primary_key=True, index=True)
    item_id    = Column(Integer, ForeignKey("items.id"), nullable=False)
    url        = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    item = relationship("Item", back_populates="foto")