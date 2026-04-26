from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import auth, item, claim, leaderboard, notification, match

import os

app = FastAPI(title="IPB Lost & Found API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(item.router)
app.include_router(claim.router)
app.include_router(leaderboard.router) 
app.include_router(notification.router)
app.include_router(match.router)


@app.get("/")
def root():
    return {"message": "IPB Lost & Found API is running"}