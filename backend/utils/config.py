from pathlib import Path
from pydantic_settings import BaseSettings


# Get path of backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./resumes.db"

    # JWT Settings
    JWT_SECRET_KEY: str = "please_change_me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Upload Directory
    UPLOAD_DIR: str = "./uploads"

    class Config:
        env_file = str(ENV_PATH)
        env_file_encoding = "utf-8"
        extra = "ignore"   # ignore unknown env vars


settings = Settings()


if __name__ == "__main__":
    print("Loaded environment from:", ENV_PATH)
    print("Database URL:", settings.DATABASE_URL)
