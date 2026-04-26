from fastapi import HTTPException, UploadFile
from app.repositories.item_repo import ItemRepository
from app.models.item import Item, ItemFoto, ItemType, ItemCategory, ItemStatus
from app.models.user import User, UserRole
from app.schemas.item import ItemCreate
from typing import Optional
import os, uuid

UPLOAD_DIR = "uploads"

class ItemService:
    def __init__(self, item_repo: ItemRepository):
        self.item_repo = item_repo

    def lapor(self, payload: ItemCreate, current_user: User) -> Item:
        item = Item(**payload.model_dump(), user_id=current_user.id)
        return self.item_repo.save(item)

    def get_all(
        self,
        tipe: Optional[ItemType],
        kategori: Optional[ItemCategory],
        status: Optional[ItemStatus],
        q: Optional[str],
        current_user: Optional[User]
    ) -> list[Item]:
        # Sembunyikan item expired dan closed dari list publik
        items = self.item_repo.get_all(tipe, kategori, status, q)
        result = []

        for item in items:
            # Skip expired dan closed untuk tampilan publik
            if item.status in [ItemStatus.expired, ItemStatus.closed]:
                continue

            # Guest: sembunyikan foto barang FOUND
            if current_user is None and item.tipe == ItemType.found:
                item.foto = []

            result.append(item)

        return result

    def get_detail(self, item_id: int, current_user: Optional[User]) -> Item:
        item = self.item_repo.get_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

        # Guest: sembunyikan foto FOUND
        if current_user is None and item.tipe == ItemType.found:
            item.foto = []

        return item

    def get_all_for_admin(self) -> list[Item]:
        """Admin bisa lihat semua termasuk expired dan closed"""
        return self.item_repo.get_all()

    def upload_foto(self, item_id: int, file: UploadFile, current_user: User) -> Item:
        item = self.item_repo.get_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Barang tidak ditemukan")
        if item.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Bukan barang kamu")

        allowed = ["image/jpeg", "image/png", "image/webp"]
        if file.content_type not in allowed:
            raise HTTPException(status_code=400, detail="Format foto tidak didukung")

        contents = file.file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Ukuran foto maksimal 5MB")

        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
            f.write(contents)

        foto = ItemFoto(item_id=item_id, url=f"/uploads/{filename}")
        self.item_repo.add_foto(foto)
        return self.item_repo.get_by_id(item_id)

    def upload_bukti_kepemilikan(self, item_id: int, file: UploadFile, current_user: User) -> Item:
        """Khusus barang LOST — upload bukti kepemilikan"""
        item = self.item_repo.get_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Barang tidak ditemukan")
        if item.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Bukan barang kamu")
        if item.tipe != ItemType.lost:
            raise HTTPException(status_code=400, detail="Hanya untuk barang hilang")

        allowed = ["image/jpeg", "image/png", "image/webp"]
        if file.content_type not in allowed:
            raise HTTPException(status_code=400, detail="Format file tidak didukung")

        contents = file.file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Ukuran file maksimal 5MB")

        ext = file.filename.split(".")[-1]
        filename = f"bukti_{uuid.uuid4()}.{ext}"
        with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
            f.write(contents)

        current_bukti = item.bukti_kepemilikan or []
        item.bukti_kepemilikan = current_bukti + [f"/uploads/{filename}"]
        return self.item_repo.save(item)

    def hapus(self, item_id: int, current_user: User) -> None:
        item = self.item_repo.get_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Barang tidak ditemukan")
        if item.user_id != current_user.id and current_user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="Tidak punya akses")
        self.item_repo.delete(item)

    def expire_items(self) -> int:
        """Dipanggil oleh scheduler — expire item yang sudah lewat 30 hari"""
        from datetime import datetime
        items = self.item_repo.get_all(status=ItemStatus.open)
        count = 0
        for item in items:
            if item.expired_at and datetime.utcnow() > item.expired_at.replace(tzinfo=None):
                item.status = ItemStatus.expired
                self.item_repo.save(item)
                count += 1
        return count