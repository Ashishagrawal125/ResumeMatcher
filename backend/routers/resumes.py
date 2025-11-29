from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    BackgroundTasks,
    HTTPException,
    Depends
)
from sqlmodel import Session
from typing import List, Optional
import os

from backend.database import get_session
from backend.models import Resume
from backend.utils.config import settings
from backend.resume_parser_service import parser as resume_parser
from backend.resume_parser_service import matcher as resume_matcher

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.post("/upload", summary="Upload JD + multiple resumes (NO AUTH – DEMO MODE)")
async def upload_resumes(
    background_tasks: BackgroundTasks,
    resumes: List[UploadFile] = File(...),
    job_description: Optional[str] = Form(None),
    jd_file: Optional[UploadFile] = File(None),
    session: Session = Depends(get_session),
):
    """
    DEMO MODE VERSION:
    - Authentication disabled
    - Accepts 'resumes' (list of files)
    - Accepts 'job_description' text
    - Matches resumes against the JD
    - Saves records to DB
    """

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # -----------------------------
    # 1. GET JOB DESCRIPTION
    # -----------------------------
    if not job_description and not jd_file:
        raise HTTPException(400, "Provide job_description or jd_file")

    if jd_file:
        jd_name = jd_file.filename.replace(" ", "_")
        jd_path = os.path.join(settings.UPLOAD_DIR, jd_name)
        resume_parser.save_upload_file(jd_file, jd_path)
        job_description = resume_parser.parse_resume(jd_path, jd_name)

    if not job_description:
        raise HTTPException(400, "Unable to extract job description")

    jd_tokens = set(resume_matcher.extract_tokens(job_description))
    if not jd_tokens:
        raise HTTPException(400, "No keywords found in the JD")

    # -----------------------------
    # 2. PROCESS RESUMES
    # -----------------------------
    results = []

    for upload in resumes:
        fname = upload.filename.replace(" ", "_")
        dest_path = os.path.join(settings.UPLOAD_DIR, fname)

        resume_parser.save_upload_file(upload, dest_path)
        text = resume_parser.parse_resume(dest_path, fname)

        import re
        m = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
        email = m.group(0) if m else None

        first_lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
        name = first_lines[0][:120] if first_lines else None

        resume_tokens = set(resume_matcher.extract_tokens(text))
        matches = resume_tokens.intersection(jd_tokens)
        score = len(matches) / len(jd_tokens)

        record = Resume(
            filename=fname,
            filepath=dest_path,
            parsed_text=text,
            email=email,
            name=name,
            matched_job="Uploaded JD",
            match_score=score,
        )
        session.add(record)
        session.commit()
        session.refresh(record)

        # EMAIL DISABLED (important for Render deployment)
        # email_sender.queue_result_email(background_tasks, email, selected, "Uploaded JD")

        results.append({
            "filename": fname,
            "email": email,
            "name": name,
            "score": round(score, 2),
            "selected": score >= 0.3
        })

    return {
        "jd_summary": (
            job_description[:300] + "..."
            if len(job_description) > 300 else job_description
        ),
        "total_resumes": len(results),
        "results": results,
    }
