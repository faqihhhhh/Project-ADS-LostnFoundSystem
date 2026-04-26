from app.repositories.notification_repo import NotificationRepository
from app.models.notification import Notification

class NotificationService:
    def __init__(self, notif_repo: NotificationRepository):
        self.notif_repo = notif_repo

    def kirim(self, user_id: int, judul: str, pesan: str) -> Notification:
        notif = Notification(user_id=user_id, judul=judul, pesan=pesan)
        return self.notif_repo.save(notif)

    def get_milik_saya(self, user_id: int) -> list[Notification]:
        return self.notif_repo.get_by_user(user_id)

    def tandai_sudah_dibaca(self, user_id: int) -> None:
        self.notif_repo.mark_all_read(user_id)