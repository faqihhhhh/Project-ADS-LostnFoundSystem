from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserOut
from app.core.security import verify_password, create_access_token
from app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # Cari user berdasarkan username
    user = db.query(User).filter(User.username == payload.username).first()
    
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Username atau password salah")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Akun dinonaktifkan")
    
    token = create_access_token(data={"sub": user.username, "role": user.role})
    
    return TokenResponse(
        access_token=token,
        role=user.role,
        nama=user.nama
    )

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Endpoint untuk cek siapa yang sedang login."""
    return current_user