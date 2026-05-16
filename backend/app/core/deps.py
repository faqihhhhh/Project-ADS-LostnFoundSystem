from fastapi import Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole

bearer_scheme = HTTPBearer(auto_error=False)

def get_pagination_params(
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=100)
):
    return {"skip": skip, "limit": limit}

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Wajib login. Mahasiswa atau admin."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Tidak terautentikasi")
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Token tidak valid atau kadaluarsa")
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Akun tidak ditemukan")
    return user

def get_current_mahasiswa(current_user: User = Depends(get_current_user)) -> User:
    """Khusus mahasiswa. Admin tidak bisa akses."""
    if current_user.role != UserRole.mahasiswa:
        raise HTTPException(status_code=403, detail="Akses ditolak: hanya mahasiswa")
    return current_user

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Khusus admin. Mahasiswa tidak bisa akses."""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Akses ditolak: hanya admin")
    return current_user

def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User | None:
    """Boleh guest. Return None kalau tidak login."""
    if not credentials:
        return None
    payload = decode_token(credentials.credentials)
    if not payload:
        return None
    return db.query(User).filter(User.username == payload.get("sub")).first()