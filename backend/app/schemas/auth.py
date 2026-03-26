from pydantic import BaseModel
from app.models.user import UserRole
from typing import Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    nama: str

class UserOut(BaseModel):
    id: int
    username: str
    nim: Optional[str] = None
    nama: str
    email: str
    role: UserRole
    poin: int

    class Config:
        from_attributes = True