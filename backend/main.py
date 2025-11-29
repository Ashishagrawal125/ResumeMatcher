import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db

from .utils.config import settings
from .auth import routes as auth_routes
from .routers import resumes as resume_routes


# create upload dir
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="Resume Parser & Job Matching API", version="1.0")

# CORS - adjust origins for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(auth_routes.router)
app.include_router(resume_routes.router)

@app.get("/")
def root():
    return {"status": "ok"}
