from sqlalchemy.orm import Session
from app.models.item_match import ItemMatch, MatchStatus

class ItemMatchRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, match_id: int) -> ItemMatch | None:
        return self.db.query(ItemMatch).filter(ItemMatch.id == match_id).first()

    def get_pending(self) -> list[ItemMatch]:
        return (
            self.db.query(ItemMatch)
            .filter(ItemMatch.status == MatchStatus.pending)
            .order_by(ItemMatch.created_at.desc())
            .all()
        )

    def get_by_found_and_lost(self, found_id: int, lost_id: int) -> ItemMatch | None:
        return self.db.query(ItemMatch).filter(
            ItemMatch.found_item_id == found_id,
            ItemMatch.lost_item_id == lost_id
        ).first()

    def save(self, match: ItemMatch) -> ItemMatch:
        self.db.add(match)
        self.db.commit()
        self.db.refresh(match)
        return match