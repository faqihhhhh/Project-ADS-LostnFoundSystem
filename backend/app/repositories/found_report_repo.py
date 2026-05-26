from sqlalchemy.orm import Session, joinedload
from app.models.found_report import FoundReport, FoundReportStatus

class FoundReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, report_id: int) -> FoundReport | None:
        return self.db.query(FoundReport).options(
            joinedload(FoundReport.reporter),
            joinedload(FoundReport.lost_item)
        ).filter(FoundReport.id == report_id).first()

    def get_by_reporter(self, reporter_id: int, skip: int = 0, limit: int = 24) -> list[FoundReport]:
        return (
            self.db.query(FoundReport)
            .options(joinedload(FoundReport.lost_item))
            .filter(FoundReport.reporter_id == reporter_id)
            .order_by(FoundReport.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_lost_item_and_reporter(self, lost_item_id: int, reporter_id: int) -> FoundReport | None:
        return self.db.query(FoundReport).filter(
            FoundReport.lost_item_id == lost_item_id,
            FoundReport.reporter_id == reporter_id
        ).first()

    def get_all_pending(self, skip: int = 0, limit: int = 24) -> list[FoundReport]:
        return (
            self.db.query(FoundReport)
            .options(
                joinedload(FoundReport.reporter),
                joinedload(FoundReport.lost_item)
            )
            .filter(FoundReport.status == FoundReportStatus.pending)
            .order_by(FoundReport.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def save(self, report: FoundReport) -> FoundReport:
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report