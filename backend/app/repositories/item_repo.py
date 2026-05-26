from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.models.item import Item, ItemFoto, ItemType, ItemCategory, ItemStatus, ItemLocation

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
        exclude_statuses: Optional[list[ItemStatus]] = None,
        lokasi: Optional[ItemLocation] = None,
        q: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: Optional[int] = 24
    ) -> list[Item]:
        query = self.db.query(Item)
        if tipe:
            query = query.filter(Item.tipe == tipe)
        if kategori:
            query = query.filter(Item.kategori == kategori)
        if status:
            query = query.filter(Item.status == status)
        if exclude_statuses:
            query = query.filter(Item.status.notin_(exclude_statuses))
            
        if lokasi:
            query = query.filter(
                (Item.lokasi_ditemukan_list == lokasi) |
                (Item.lokasi_kemungkinan_list.any(lokasi))
            )
        if q:
            query = query.filter(
                Item.nama_publik.ilike(f"%{q}%") | 
                Item.deskripsi_detail.ilike(f"%{q}%")
            )
        
        if start_date:
            query = query.filter(Item.tanggal >= start_date)
        if end_date:
            query = query.filter(Item.tanggal <= end_date)

        query = query.order_by(Item.tanggal.desc()).offset(skip)
        if limit is not None:
            query = query.limit(limit)
            
        return query.all()

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