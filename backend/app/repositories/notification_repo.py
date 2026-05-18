from sqlalchemy.orm import Session
from app.models.notification import Notification

class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: int, skip: int = 0, limit: int = 24) -> list[Notification]:
        return (
            self.db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def save(self, notif: Notification) -> Notification:
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif

    def mark_all_read(self, user_id: int) -> None:
        self.db.query(Notification)\
            .filter(Notification.user_id == user_id)\
            .update({"is_read": True})
        self.db.commit()