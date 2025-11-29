# debug_env.py
from backend.utils.config import settings

print("RUNNING debug_env.py\n")
print("SMTP_HOST:", settings.SMTP_HOST)
print("SMTP_PORT:", settings.SMTP_PORT)
print("SMTP_USERNAME:", settings.SMTP_USERNAME)
print("SMTP_PASSWORD (length):", None if settings.SMTP_PASSWORD is None else len(settings.SMTP_PASSWORD))
print("EMAIL_FROM:", settings.EMAIL_FROM)
