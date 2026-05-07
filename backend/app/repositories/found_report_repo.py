from sqlalchemy.orm import Session
from app.models.found_report import FoundReport, FoundReportStatus

class FoundReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, report_id: int) -> FoundReport | None:
        return self.db.query(FoundReport).filter(FoundReport.id == report_id).first()

    def get_by_reporter(self, reporter_id: int) -> list[FoundReport]:
        return (
            self.db.query(FoundReport)
            .filter(FoundReport.reporter_id == reporter_id)
            .order_by(FoundReport.created_at.desc())
            .all()
        )

    def get_by_lost_item_and_reporter(self, lost_item_id: int, reporter_id: int) -> FoundReport | None:
        return self.db.query(FoundReport).filter(
            FoundReport.lost_item_id == lost_item_id,
            FoundReport.reporter_id == reporter_id
        ).first()

    def get_all_pending(self) -> list[FoundReport]:
        return (
            self.db.query(FoundReport)
            .filter(FoundReport.status == FoundReportStatus.pending)
            .order_by(FoundReport.created_at.desc())
            .all()
        )

    def save(self, report: FoundReport) -> FoundReport:
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report