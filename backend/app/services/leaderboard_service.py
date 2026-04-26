from app.repositories.user_repo import UserRepository
from app.repositories.point_log_repo import PointLogRepository
from app.models.user import User
from app.schemas.leaderboard import LeaderboardResponse, LeaderboardEntry, PointLogOut
from typing import Optional

class LeaderboardService:
    def __init__(self, user_repo: UserRepository, point_log_repo: PointLogRepository):
        self.user_repo       = user_repo
        self.point_log_repo  = point_log_repo

    def get_leaderboard(self, current_user: Optional[User]) -> LeaderboardResponse:
        top_users = self.user_repo.get_all_order_by_poin(limit=10)

        top10 = [
            LeaderboardEntry(peringkat=i+1, user_id=u.id, nama=u.nama, poin=u.poin)
            for i, u in enumerate(top_users)
        ]

        poin_saya, peringkat_saya = None, None
        if current_user:
            poin_saya = current_user.poin
            peringkat_saya = self.user_repo.count_users_above_poin(current_user.poin) + 1

        return LeaderboardResponse(top10=top10, poin_saya=poin_saya, peringkat_saya=peringkat_saya)

    def get_riwayat(self, user_id: int) -> list[PointLogOut]:
        logs = self.point_log_repo.get_by_user(user_id)
        return [
            PointLogOut(id=l.id, jumlah=l.jumlah, alasan=l.alasan, created_at=str(l.created_at))
            for l in logs
        ]