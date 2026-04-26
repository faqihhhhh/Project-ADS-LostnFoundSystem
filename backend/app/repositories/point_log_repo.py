from sqlalchemy.orm import Session
from app.models.point_log import PointLog

class PointLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: int) -> list[PointLog]:
        return (
            self.db.query(PointLog)
            .filter(PointLog.user_id == user_id)
            .order_by(PointLog.created_at.desc())
            .all()
        )

    def save(self, log: PointLog) -> PointLog:
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log