from sqlalchemy.orm import Session
from app.models.claim import Claim

class ClaimRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, claim_id: int) -> Claim | None:
        return self.db.query(Claim).filter(Claim.id == claim_id).first()

    def get_by_user(self, user_id: int) -> list[Claim]:
        return self.db.query(Claim).filter(Claim.user_id == user_id).all()

    def get_by_item_and_user(self, item_id: int, user_id: int) -> Claim | None:
        return self.db.query(Claim).filter(
            Claim.item_id == item_id,
            Claim.user_id == user_id
        ).first()

    def get_all(self) -> list[Claim]:
        return self.db.query(Claim).order_by(Claim.created_at.desc()).all()

    def save(self, claim: Claim) -> Claim:
        self.db.add(claim)
        self.db.commit()
        self.db.refresh(claim)
        return claim

    def commit(self) -> None:
        self.db.commit()