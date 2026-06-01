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


class ItemLocation(str, enum.Enum):
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

class IPBLocation(str, enum.Enum):
    # --- POS SATPAM FAKULTAS ---
    POS_SATPAM_FAPERTA = "Pos Satpam Faperta"
    POS_SATPAM_SKHB = "Pos Satpam SKHB"
    POS_SATPAM_FPIK = "Pos Satpam FPIK"
    POS_SATPAM_FAPET = "Pos Satpam Fapet"
    POS_SATPAM_FAHUTAN = "Pos Satpam Fahutan"
    POS_SATPAM_FATETA = "Pos Satpam Fateta"
    POS_SATPAM_FMIPA = "Pos Satpam FMIPA"
    POS_SATPAM_FEM = "Pos Satpam FEM"
    POS_SATPAM_FEMA = "Pos Satpam Fema"

    # --- GEDUNG PERKULIAHAN & FASILITAS PUSAT ---
    CCR_INFO_DESK = "Meja Informasi CCR Lantai 1"
    PERPUS_PUSAT_CIRCULATION = "Meja Sirkulasi Perpustakaan Pusat"
    GKB_LOBBY = "Lobi Utama Gedung Kuliah Bersama (GKB)"

    # --- FASILITAS UMUM, RUMAH IBADAH, & OLAHRAGA ---
    MASJID_AL_HURRIYYAH = "Sekretariat Masjid Al-Hurriyyah"
    GWW_SECURITY = "Pos Keamanan Pintu Utama GWW"
    GYMNASIUM_OFFICE = "Ruang Pengelola Gymnasium"
    KLINIK_IPB = "Resepsionis Klinik IPB Dramaga"

    # --- PUSAT ADMINISTRASI & MAHASISWA ---
    REKTORAT_AHN = "Pos Pengamanan Lobi Rektorat AHN"
    STUDENT_CENTER_BEM = "Sekretariat BEM KM IPB (Student Center)"

    # --- ASRAMA & HUB TRANSPORTASI ---
    ASRAMA_PKU_PUTRA = "Kantor Pengelola Asrama PKU Putra"
    ASRAMA_PKU_PUTRI = "Kantor Pengelola Asrama PKU Putri"
    ASRAMA_SYLVAPINUS = "Pos Penjagaan Asrama Sylvapinus"
    SHELTER_BUS_REKTORAT = "Shelter Bus Kampus Rektorat"


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
    lokasi_sekarang     = Column(Enum(IPBLocation), nullable=True)

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

    @property
    def user_nama(self):
        return self.user.nama if self.user else None

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