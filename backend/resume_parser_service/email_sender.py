# from fastapi import BackgroundTasks
# from email.mime.text import MIMEText
# import smtplib
# from ..utils.config import settings
# from typing import Optional

# def send_email_sync(to_email: str, subject: str, body: str):
#     msg = MIMEText(body, "html")
#     msg["Subject"] = subject
#     msg["From"] = settings.EMAIL_FROM or settings.SMTP_USERNAME
#     msg["To"] = to_email

#     with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
#         server.starttls()
#         # server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
#         server.send_message(msg)

# def queue_result_email(background_tasks: BackgroundTasks, to_email: str, selected: bool, job_title: Optional[str]):
#     if not to_email:
#         return
#     if selected:
#         subject = f"Congratulations — You matched for {job_title}"
#         body = f"<p>Hi,</p><p>Good news — you matched with job <strong>{job_title}</strong>. Our HR will contact you soon.</p>"
#     else:
#         subject = "Update on your application"
#         body = "<p>Hi,</p><p>Thank you for applying. We reviewed your resume but are moving forward with other candidates.</p>"
#     background_tasks.add_task(send_email_sync, to_email, subject, body)



# from fastapi import BackgroundTasks
# from email.mime.text import MIMEText
# import smtplib
# from ..utils.config import settings
# from typing import Optional

# def send_email_sync(to_email: str, subject: str, body: str):
#     try:
#         msg = MIMEText(body, "html")
#         msg["Subject"] = subject
#         msg["From"] = settings.EMAIL_FROM or settings.SMTP_USERNAME
#         msg["To"] = to_email

#         with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
#             server.starttls()
#             # Commented out to avoid login issues in dev
#             # server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
#             server.send_message(msg)
#         print(f"[EMAIL SENT] to {to_email} | subject: {subject}")
#     except Exception as e:
#         print(f"[EMAIL ERROR] Failed to send email to {to_email}: {e}")

# def queue_result_email(background_tasks: BackgroundTasks, to_email: str, selected: bool, job_title: Optional[str]):
#     if not to_email:
#         return
#     if selected:
#         subject = f"Congratulations — You matched for {job_title}"
#         body = f"""
#         <p>Hi,</p>
#         <p>Good news — you matched with the job <strong>{job_title}</strong>! 
#         Our HR team will contact you soon.</p>
#         """
#     else:
#         subject = "Update on your application"
#         body = """
#         <p>Hi,</p>
#         <p>Thank you for applying. We reviewed your resume but are moving forward with other candidates.</p>
#         """
#     background_tasks.add_task(send_email_sync, to_email, subject, body)




from fastapi import BackgroundTasks
from email.mime.text import MIMEText
import smtplib
from ..utils.config import settings
from typing import Optional

def send_email_sync(to_email: str, subject: str, body: str):
    try:
        msg = MIMEText(body, "html")
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_FROM or settings.SMTP_USERNAME
        msg["To"] = to_email

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)  # ✅ re-enabled login
            server.send_message(msg)

        print(f"[EMAIL OK] Sent to {to_email} | subject: {subject}")

    except smtplib.SMTPAuthenticationError as e:
        print(f"[EMAIL ERROR] Authentication failed: {e}")
        print("⚠️ Use a Gmail App Password, not your normal Gmail password.")
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email to {to_email}: {e}")

def queue_result_email(background_tasks: BackgroundTasks, to_email: str, selected: bool, job_title: Optional[str]):
    if not to_email:
        return

    if selected:
        subject = f"🎉 Congratulations — You matched for {job_title}"
        body = f"""
        <p>Hi,</p>
        <p>Good news — you matched with the job <strong>{job_title}</strong>! 
        Our HR team will contact you soon.</p>
        """
    else:
        subject = "Update on your application"
        body = """
        <p>Hi,</p>
        <p>Thank you for applying. We reviewed your resume but are moving forward with other candidates.</p>
        """

    background_tasks.add_task(send_email_sync, to_email, subject, body)
