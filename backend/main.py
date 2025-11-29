import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import init_db
from backend.utils.config import settings
from backend.auth import routes as auth_routes
from backend.routers import resumes as resume_routes


# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


app = FastAPI(
    title="Resume Parser & Job Matching API",
    version="1.0"
)


# CORS (allow frontend access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # You can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


# Include routes
app.include_router(auth_routes.router)
app.include_router(resume_routes.router)


@app.get("/")
def root():
    return {"status": "ok"}
