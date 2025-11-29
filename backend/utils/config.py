# from pydantic import BaseSettings

# class Settings(BaseSettings):
#     DATABASE_URL: str = "sqlite:///./resumes.db"
#     JWT_SECRET_KEY: str = "please_change_me"
#     JWT_ALGORITHM: str = "HS256"
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

#     SMTP_HOST: str = "smtp.gmail.com"
#     SMTP_PORT: int = 587
#     SMTP_USERNAME: str = ""
#     SMTP_PASSWORD: str = ""
#     EMAIL_FROM: str = ""

#     UPLOAD_DIR: str = "./uploads"

#     class Config:
#         env_file = ".env"
#         env_file_encoding = "utf-8"

# settings = Settings()



import os
from pathlib import Path
from pydantic import BaseSettings
from dotenv import load_dotenv

# ------------------------------------------------------------
# Force-load the .env file explicitly (Windows-safe)
# ------------------------------------------------------------

# Get absolute path of backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
ENV_PATH = BASE_DIR / ".env"

# Load .env manually before Pydantic (in case it fails automatically)
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    print(f"[WARN] .env not found at {ENV_PATH}")

# ------------------------------------------------------------
# Settings Class
# ------------------------------------------------------------

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./resumes.db"

    # JWT
    JWT_SECRET_KEY: str = "please_change_me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # SMTP / Email Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = ""

    # Upload Directory
    UPLOAD_DIR: str = "./uploads"

    # Read environment variables explicitly from backend/.env
    class Config:
        env_file = str(ENV_PATH)
        env_file_encoding = "utf-8"

# ------------------------------------------------------------
# Instantiate settings
# ------------------------------------------------------------
settings = Settings()

# Optional Debug Print
if __name__ == "__main__":
    print("Loaded environment from:", ENV_PATH)
    print("SMTP_USERNAME:", settings.SMTP_USERNAME)
    print("SMTP_PASSWORD (len):", len(settings.SMTP_PASSWORD or ""))
    print("EMAIL_FROM:", settings.EMAIL_FROM)
