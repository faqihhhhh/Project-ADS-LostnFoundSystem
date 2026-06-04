from fastapi import HTTPException
from app.repositories.user_repo import UserRepository
from app.core.security import verify_password, create_access_token
from app.schemas.auth import LoginRequest, TokenResponse

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def login(self, payload: LoginRequest) -> TokenResponse:
        user = self.user_repo.get_by_username(payload.username)

        if not user or not verify_password(payload.password, user.password):
            raise HTTPException(status_code=401, detail="Username atau password salah")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Akun dinonaktifkan")

        token = create_access_token(data={"sub": user.username, "role": user.role})
        return TokenResponse(
            access_token=token, 
            role=user.role, 
            nama=user.nama, 
            id=user.id
        )