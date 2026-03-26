from app.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

db = SessionLocal()

users = [
    # Admin — tidak punya NIM
    User(
        username="admin_kemahasiswaan",
        nim=None,
        nama="Admin Kemahasiswaan IPB",
        email="kemahasiswaan@ipb.ac.id",
        password=hash_password("admin123"),
        role=UserRole.admin
    ),
    # Mahasiswa — username dari akun IPB mereka
    User(
        username="budi.santoso",
        nim="G6401211001",
        nama="Budi Santoso",
        email="budi.santoso@apps.ipb.ac.id",
        password=hash_password("mahasiswa123"),
        role=UserRole.mahasiswa
    ),
    User(
        username="siti.rahayu",
        nim="G6401211002",
        nama="Siti Rahayu",
        email="siti.rahayu@apps.ipb.ac.id",
        password=hash_password("mahasiswa123"),
        role=UserRole.mahasiswa
    ),
]

for u in users:
    existing = db.query(User).filter(User.username == u.username).first()
    if not existing:
        db.add(u)

db.commit()
db.close()
print("Seed berhasil!")