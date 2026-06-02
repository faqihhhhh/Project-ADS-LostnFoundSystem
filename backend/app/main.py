from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import auth, item, claim, leaderboard, notification, match, found_report
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.item_service import ItemService
from app.repositories.item_repo import ItemRepository
from app.database import SessionLocal

import os

app = FastAPI(title="LostnFound API", version="1.0.0")

app.include_router(found_report.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://project-ads-lostn-found-system.vercel.app",
        "https://project-ads-lostn-found-system-git-main-faqihhhhhs-projects.vercel.app"
    ],
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
    return {"message": "LostnFound API is running"}

def job_expire_items():
    db = SessionLocal()
    try:
        service = ItemService(ItemRepository(db))
        count = service.expire_items()
        print(f"[Scheduler] {count} item diexpire")
    finally:
        db.close()

scheduler = BackgroundScheduler()
scheduler.add_job(job_expire_items, "interval", hours=24)
scheduler.start()