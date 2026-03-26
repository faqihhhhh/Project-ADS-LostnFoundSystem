from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth                          # ← tambah ini

app = FastAPI(title="IPB Lost & Found API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)                       # ← tambah ini

@app.get("/")
def root():
    return {"message": "IPB Lost & Found API is running"}