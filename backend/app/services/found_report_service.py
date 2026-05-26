from fastapi import HTTPException, UploadFile
from app.repositories.found_report_repo import FoundReportRepository
from app.repositories.item_repo import ItemRepository
from app.repositories.user_repo import UserRepository
from app.repositories.point_log_repo import PointLogRepository
from app.services.notification_service import NotificationService
from app.models.found_report import FoundReport, FoundReportStatus
from app.models.item import ItemType, ItemStatus
from app.models.point_log import PointLog
from app.models.user import User
from app.schemas.found_report import FoundReportCreate
import secrets, string, os, uuid

UPLOAD_DIR = "uploads"

class FoundReportService:
    def __init__(
        self,
        report_repo: FoundReportRepository,
        item_repo: ItemRepository,
        user_repo: UserRepository,
        point_log_repo: PointLogRepository,
        notif_service: NotificationService
    ):
        self.report_repo    = report_repo
        self.item_repo      = item_repo
        self.user_repo      = user_repo
        self.point_log_repo = point_log_repo
        self.notif_service  = notif_service

    def _generate_kode(self, length: int = 6) -> str:
        chars = string.ascii_uppercase + string.digits
        return ''.join(secrets.choice(chars) for _ in range(length))

    def ajukan(self, payload: FoundReportCreate, current_user: User) -> FoundReport:
        # Validasi item ada dan bertipe LOST
        item = self.item_repo.get_by_id(payload.lost_item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Laporan barang hilang tidak ditemukan")
        if item.tipe != ItemType.lost:
            raise HTTPException(status_code=400, detail="Hanya bisa dilaporkan untuk barang hilang")
        if item.status != ItemStatus.open:
            raise HTTPException(status_code=409, detail="Barang hilang ini sudah dalam proses penanganan")

        # Tidak bisa lapor barang hilang milik sendiri
        if item.user_id == current_user.id:
            raise HTTPException(status_code=400, detail="Tidak bisa melaporkan barang hilang milikmu sendiri")

        # Cek duplikat
        existing = self.report_repo.get_by_lost_item_and_reporter(
            payload.lost_item_id, current_user.id
        )
        if existing:
            raise HTTPException(status_code=400, detail="Kamu sudah mengajukan laporan untuk barang hilang ini")

        report = FoundReport(
            lost_item_id=payload.lost_item_id,
            reporter_id=current_user.id,
            deskripsi=payload.deskripsi,
            lokasi_sekarang=payload.lokasi_sekarang
        )
        return self.report_repo.save(report)

    def upload_foto(self, report_id: int, file: UploadFile, current_user: User) -> FoundReport:
        report = self.report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
        if report.reporter_id != current_user.id:
            raise HTTPException(status_code=403, detail="Bukan laporan kamu")
        if report.status != FoundReportStatus.pending:
            raise HTTPException(status_code=400, detail="Laporan sudah diproses")

        allowed = ["image/jpeg", "image/png", "image/webp"]
        if file.content_type not in allowed:
            raise HTTPException(status_code=400, detail="Format foto tidak didukung")

        contents = file.file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Ukuran foto maksimal 5MB")

        ext = file.filename.split(".")[-1]
        filename = f"found_report_{uuid.uuid4()}.{ext}"
        with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
            f.write(contents)

        report.foto_bukti = (report.foto_bukti or []) + [f"/uploads/{filename}"]
        return self.report_repo.save(report)

    def approve(self, report_id: int, catatan: str) -> FoundReport:
        report = self.report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
        if report.status != FoundReportStatus.pending:
            raise HTTPException(status_code=400, detail="Laporan sudah diproses")

        kode = self._generate_kode()
        report.status = FoundReportStatus.approved
        report.catatan_admin = catatan
        report.kode_pengambilan = kode

        # Tutup barang hilang
        report.lost_item.status = ItemStatus.closed

        # Tambah poin ke reporter (penemu)
        reporter = self.user_repo.get_by_id(report.reporter_id)
        if reporter:
            reporter.poin += 10
            self.user_repo.save(reporter)
            self.point_log_repo.save(PointLog(
                user_id=reporter.id,
                jumlah=10,
                alasan=f"Melaporkan penemuan barang '{report.lost_item.nama_publik}'"
            ))
            # Notifikasi ke penemu
            self.notif_service.kirim(
                user_id=reporter.id,
                judul="Laporan penemuanmu disetujui! +10 poin",
                pesan=(
                    f"Admin mengkonfirmasi laporanmu untuk barang '{report.lost_item.nama_publik}'. "
                    f"Kamu mendapat +10 poin. Terima kasih sudah membantu!"
                )
            )

        # Notifikasi ke pemilik barang hilang beserta kode pengambilan
        pesan_pemilik = (
            f"Seseorang melaporkan menemukan barang '{report.lost_item.nama_publik}'. "
            f"Barang berada di: {report.lokasi_sekarang}. "
            f"Kode pengambilan: {kode}. "
            f"Tunjukkan kode ini ke petugas saat mengambil barang."
        )
        if catatan:
            pesan_pemilik += f"\n\nCatatan Admin: {catatan}"

        self.notif_service.kirim(
            user_id=report.lost_item.user_id,
            judul="Barang hilangmu ditemukan!",
            pesan=pesan_pemilik
        )

        return self.report_repo.save(report)

    def reject(self, report_id: int, catatan: str) -> FoundReport:
        report = self.report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
        if report.status != FoundReportStatus.pending:
            raise HTTPException(status_code=400, detail="Laporan sudah diproses")

        report.status = FoundReportStatus.rejected
        report.catatan_admin = catatan

        # Notifikasi ke pelapor
        pesan_tolak = f"Laporan penemuanmu untuk '{report.lost_item.nama_publik}' ditolak oleh admin."
        if catatan:
            pesan_tolak += f"\n\nCatatan Admin: {catatan}"

        self.notif_service.kirim(
            user_id=report.reporter_id,
            judul="Laporan penemuan ditolak",
            pesan=pesan_tolak
        )

        return self.report_repo.save(report)