from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole

bearer_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Wajib login. Kalau tidak ada token → 401."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Tidak terautentikasi")
    
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Token tidak valid atau kadaluarsa")
    
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Akun tidak ditemukan")
    
    return user

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Khusus admin. Kalau bukan admin → 403."""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Akses ditolak: hanya admin")
    return current_user

def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User | None:
    """Boleh guest. Kalau ada token → return user, kalau tidak → return None."""
    if not credentials:
        return None
    payload = decode_token(credentials.credentials)
    if not payload:
        return None
    return db.query(User).filter(User.nim == payload.get("sub")).first()