from sqlalchemy.orm import Session
from app.models.user import User

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_username(self, username: str) -> User | None:
        return self.db.query(User).filter(User.username == username).first()

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_all_order_by_poin(self, limit: int = 10) -> list[User]:
        return (
            self.db.query(User)
            .filter(User.poin > 0)
            .order_by(User.poin.desc())
            .limit(limit)
            .all()
        )

    def count_users_above_poin(self, poin: int) -> int:
        return self.db.query(User).filter(User.poin > poin).count()

    def save(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user