import smtplib
from backend.utils.config import settings

email = settings.SMTP_USERNAME
password = settings.SMTP_PASSWORD

print(f"Trying to login to Gmail as {email}...")

try:
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(email, password)
    print("✅ SMTP login successful! Gmail accepted your credentials.")
except Exception as e:
    print("❌ SMTP login FAILED:", repr(e))
