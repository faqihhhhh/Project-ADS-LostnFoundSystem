from fastapi import HTTPException, UploadFile
from app.repositories.claim_repo import ClaimRepository
from app.repositories.item_repo import ItemRepository
from app.repositories.user_repo import UserRepository
from app.repositories.point_log_repo import PointLogRepository
from app.models.claim import Claim, ClaimStatus
from app.models.item import ItemStatus, ItemType
from app.models.point_log import PointLog
from app.models.user import User
from app.schemas.claim import ClaimCreate
from app.services.notification_service import NotificationService
import secrets, string
import os, uuid

UPLOAD_DIR = "uploads"

class ClaimService:
    def __init__(
        self,
        claim_repo: ClaimRepository,
        item_repo: ItemRepository,
        user_repo: UserRepository,
        point_log_repo: PointLogRepository,
        notif_service: NotificationService
    ):
        self.claim_repo      = claim_repo
        self.item_repo       = item_repo
        self.user_repo       = user_repo
        self.point_log_repo  = point_log_repo
        self.notif_service   = notif_service

    def _generate_kode(self, length: int = 6) -> str:
        """Generate kode pengambilan unik 6 karakter"""
        chars = string.ascii_uppercase + string.digits
        return ''.join(secrets.choice(chars) for _ in range(length))

    def ajukan(self, payload: ClaimCreate, current_user: User) -> Claim:
        item = self.item_repo.get_by_id(payload.item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Barang tidak ditemukan")
        if item.tipe != ItemType.found:
            raise HTTPException(status_code=400, detail="Hanya barang temuan yang bisa diklaim")
        if item.status != ItemStatus.open:
            raise HTTPException(status_code=409, detail="Barang sedang dalam proses verifikasi")
        if item.user_id == current_user.id:
            raise HTTPException(status_code=400, detail="Tidak bisa klaim barang milikmu sendiri")

        existing = self.claim_repo.get_by_item_and_user(payload.item_id, current_user.id)
        if existing:
            raise HTTPException(status_code=400, detail="Kamu sudah mengajukan klaim ini")

        item.status = ItemStatus.pending
        self.claim_repo.commit()

        claim = Claim(
            item_id=payload.item_id,
            user_id=current_user.id,
            deskripsi_ciri=payload.deskripsi_ciri
        )
        return self.claim_repo.save(claim)

    def upload_bukti(self, claim_id: int, file: UploadFile, current_user: User) -> Claim:
        claim = self.claim_repo.get_by_id(claim_id)
        if not claim:
            raise HTTPException(status_code=404, detail="Klaim tidak ditemukan")
        if claim.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Bukan klaim kamu")
        if claim.status != ClaimStatus.pending:
            raise HTTPException(status_code=400, detail="Klaim sudah diproses")

        allowed = ["image/jpeg", "image/png", "image/webp"]
        if file.content_type not in allowed:
            raise HTTPException(status_code=400, detail="Format foto tidak didukung")

        contents = file.file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Ukuran foto maksimal 5MB")

        ext = file.filename.split(".")[-1]
        filename = f"bukti_{uuid.uuid4()}.{ext}"
        with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
            f.write(contents)

        claim.bukti_foto = (claim.bukti_foto or []) + [f"/uploads/{filename}"]
        return self.claim_repo.save(claim)

    def approve(self, claim_id: int, catatan: str) -> Claim:
        claim = self.claim_repo.get_by_id(claim_id)
        if not claim:
            raise HTTPException(status_code=404, detail="Klaim tidak ditemukan")
        if claim.status != ClaimStatus.pending:
            raise HTTPException(status_code=400, detail="Klaim sudah diproses")

        kode = self._generate_kode()
        claim.status        = ClaimStatus.approved
        claim.catatan_admin = catatan
        claim.kode_pengambilan = kode
        claim.item.status   = ItemStatus.closed

        # Tambah poin ke penemu
        penemu = self.user_repo.get_by_id(claim.item.user_id)
        if penemu:
            penemu.poin += 10
            self.user_repo.save(penemu)
            self.point_log_repo.save(PointLog(
                user_id=penemu.id,
                jumlah=10,
                alasan=f"Barang '{claim.item.nama_publik}' berhasil dikembalikan ke pemiliknya"
            ))
            # Notifikasi ke penemu
            self.notif_service.kirim(
                user_id=penemu.id,
                judul="Klaim disetujui — kamu dapat poin!",
                pesan=f"Barang '{claim.item.nama_publik}' telah dikonfirmasi milik orang lain. Kamu mendapat +10 poin!"
            )

        # Notifikasi ke pemilik barang (pengklaim)
        self.notif_service.kirim(
            user_id=claim.user_id,
            judul="Klaim barangmu disetujui!",
            pesan=(
                f"Klaim untuk '{claim.item.nama_publik}' disetujui. "
                f"Barang berada di: {claim.item.lokasi_sekarang}. "
                f"Tunjukkan kode pengambilan ini ke petugas: {kode}"
            )
        )

        return self.claim_repo.save(claim)

    def reject(self, claim_id: int, catatan: str) -> Claim:
        claim = self.claim_repo.get_by_id(claim_id)
        if not claim:
            raise HTTPException(status_code=404, detail="Klaim tidak ditemukan")
        if claim.status != ClaimStatus.pending:
            raise HTTPException(status_code=400, detail="Klaim sudah diproses")

        claim.status = ClaimStatus.rejected
        claim.catatan_admin = catatan
        claim.item.status = ItemStatus.open
        return self.claim_repo.save(claim)