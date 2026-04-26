from sqlalchemy.orm import Session
from typing import Optional
from app.models.item import Item, ItemFoto, ItemType, ItemCategory, ItemStatus

class ItemRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, item_id: int) -> Item | None:
        return self.db.query(Item).filter(Item.id == item_id).first()

    def get_all(
        self,
        tipe: Optional[ItemType] = None,
        kategori: Optional[ItemCategory] = None,
        status: Optional[ItemStatus] = None,
        q: Optional[str] = None
    ) -> list[Item]:
        query = self.db.query(Item)
        if tipe:
            query = query.filter(Item.tipe == tipe)
        if kategori:
            query = query.filter(Item.kategori == kategori)
        if status:
            query = query.filter(Item.status == status)
        if q:
            query = query.filter(
                Item.nama.ilike(f"%{q}%") | Item.lokasi.ilike(f"%{q}%")
            )
        return query.order_by(Item.created_at.desc()).all()

    def save(self, item: Item) -> Item:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item: Item) -> None:
        self.db.delete(item)
        self.db.commit()

    def add_foto(self, foto: ItemFoto) -> ItemFoto:
        self.db.add(foto)
        self.db.commit()
        self.db.refresh(foto)
        return foto