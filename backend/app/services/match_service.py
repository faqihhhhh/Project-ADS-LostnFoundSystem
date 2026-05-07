from fastapi import HTTPException
from app.repositories.item_match_repo import ItemMatchRepository
from app.repositories.item_repo import ItemRepository
from app.repositories.notification_repo import NotificationRepository
from app.models.item_match import ItemMatch, MatchStatus
from app.models.item import Item, ItemType, ItemStatus
from app.models.notification import Notification
from app.routers import match
from app.services.notification_service import NotificationService
import secrets, string

class MatchService:
    def __init__(
        self,
        match_repo: ItemMatchRepository,
        item_repo: ItemRepository,
        notif_service: NotificationService
    ):
        self.match_repo    = match_repo
        self.item_repo     = item_repo
        self.notif_service = notif_service

    def auto_detect(self, new_item: Item) -> list[ItemMatch]:
        """
        Dipanggil setiap kali item baru dibuat.
        Cari potensi kecocokan berdasarkan kategori + lokasi.
        """
        matches = []

        if new_item.tipe == ItemType.found:
            # Item baru adalah FOUND — cari semua LOST yang kategorinya sama
            candidates = self.item_repo.get_all(
                tipe=ItemType.lost,
                kategori=new_item.kategori,
                status=ItemStatus.open
            )
            for lost in candidates:
                if self._is_lokasi_match(new_item, lost):
                    alasan = self._build_alasan(new_item, lost)
                    match = self._create_match(new_item.id, lost.id, alasan)
                    if match:
                        matches.append(match)

        elif new_item.tipe == ItemType.lost:
            # Item baru adalah LOST — cari semua FOUND yang kategorinya sama
            candidates = self.item_repo.get_all(
                tipe=ItemType.found,
                kategori=new_item.kategori,
                status=ItemStatus.open
            )
            for found in candidates:
                if self._is_lokasi_match(found, new_item):
                    alasan = self._build_alasan(found, new_item)
                    match = self._create_match(found.id, new_item.id, alasan)
                    if match:
                        matches.append(match)

        return matches

    def _is_lokasi_match(self, found_item: Item, lost_item: Item) -> bool:
        """Cek apakah lokasi found dan lost berdekatan/sama"""
        if not found_item.lokasi_ditemukan or not lost_item.lokasi_kemungkinan:
            return False

        lokasi_found = found_item.lokasi_ditemukan.lower()
        for lokasi in lost_item.lokasi_kemungkinan:
            # Cek apakah ada kata yang sama (misal: "FEM", "Dramaga", "perpus")
            kata_found = set(lokasi_found.split())
            kata_lost  = set(lokasi.lower().split())
            if kata_found & kata_lost:    # ada irisan kata
                return True
        return False

    def _build_alasan(self, found_item: Item, lost_item: Item) -> str:
        return (
            f"Kategori sama: {found_item.kategori.value} | "
            f"Lokasi temuan: {found_item.lokasi_ditemukan} | "
            f"Lokasi kemungkinan hilang: {', '.join(lost_item.lokasi_kemungkinan or [])}"
        )

    def _create_match(self, found_id: int, lost_id: int, alasan: str) -> ItemMatch | None:
        # Jangan buat duplikat
        existing = self.match_repo.get_by_found_and_lost(found_id, lost_id)
        if existing:
            return None
        match = ItemMatch(
            found_item_id=found_id,
            lost_item_id=lost_id,
            alasan_match=alasan
        )
        return self.match_repo.save(match)

    def get_pending(self) -> list[ItemMatch]:
        return self.match_repo.get_pending()


    def _generate_kode(self, length: int = 6) -> str:
        chars = string.ascii_uppercase + string.digits
        return ''.join(secrets.choice(chars) for _ in range(length))

    def confirm(self, match_id: int, catatan: str) -> ItemMatch:
        match = self.match_repo.get_by_id(match_id)
        if not match:
            raise HTTPException(status_code=404, detail="Match tidak ditemukan")
        if match.status != MatchStatus.pending:
            raise HTTPException(status_code=400, detail="Match sudah diproses")

        kode = self._generate_kode()
        match.status = MatchStatus.confirmed
        match.catatan_admin = catatan
        match.found_item.status = ItemStatus.closed
        match.lost_item.status  = ItemStatus.closed

    # Notifikasi ke pemilik barang hilang — sertakan kode pengambilan
        self.notif_service.kirim(
            user_id=match.lost_item.user_id,
            judul="Barang kamu ditemukan!",
            pesan=(
                f"Admin mengkonfirmasi barang '{match.lost_item.nama_publik}' telah ditemukan. "
                f"Lokasi barang: {match.found_item.lokasi_sekarang}. "
                f"Kode pengambilan: {kode}. "
                f"Tunjukkan kode ini ke petugas."
            )
        )

        # Notifikasi ke penemu
        self.notif_service.kirim(
            user_id=match.found_item.user_id,
            judul="Pemilik barang temuanmu ditemukan!",
            pesan=f"Barang '{match.found_item.nama_publik}' telah dikonfirmasi dan akan dikembalikan ke pemiliknya. Terima kasih!"
        )

        return self.match_repo.save(match)

    def reject(self, match_id: int, catatan: str) -> ItemMatch:
        """Admin tolak kecocokan"""
        match = self.match_repo.get_by_id(match_id)
        if not match:
            raise HTTPException(status_code=404, detail="Match tidak ditemukan")
        if match.status != MatchStatus.pending:
            raise HTTPException(status_code=400, detail="Match sudah diproses")

        match.status = MatchStatus.rejected
        match.catatan_admin = catatan
        return self.match_repo.save(match)