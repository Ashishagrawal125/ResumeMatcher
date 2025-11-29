# # backend/routers/resumes.py
# from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, BackgroundTasks
# from sqlmodel import Session
# from typing import List
# import os
# from ..database import get_session
# from ..models import Resume, User
# from ..utils.config import settings
# from ..resume_parser_service import parser as resume_parser
# from ..resume_parser_service import matcher as resume_matcher
# from ..resume_parser_service import email_sender
# from ..utils.auth_deps import get_current_user

# router = APIRouter(prefix="/resumes", tags=["resumes"])

# @router.post("/upload", summary="Upload multiple resumes (protected)")
# async def upload_resumes(
#     background_tasks: BackgroundTasks,
#     files: List[UploadFile] = File(...),
#     session: Session = Depends(get_session),
#     current_user: User = Depends(get_current_user),
# ):

#     """
#     Upload multiple resume files. This endpoint is protected — you must provide a valid JWT.
#     Use Swagger's 'Authorize' (top-right) and paste the token (either raw token or "Bearer <token>").
#     """
#     saved = []
#     os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

#     for upload in files:
#         # safe filename
#         fname = upload.filename.replace(" ", "_")
#         dest_path = os.path.join(settings.UPLOAD_DIR, fname)

#         # save file (UploadFile.file is a SpooledTemporaryFile-like object)
#         resume_parser.save_upload_file(upload, dest_path)

#         # parse
#         text = resume_parser.parse_resume(dest_path, fname)

#         # attempt to extract a candidate email from text (simple regex)
#         import re
#         m = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
#         email = m.group(0) if m else None

#         # simple name extraction heuristic (first non-empty line)
#         name = None
#         first_lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
#         if first_lines:
#             name = first_lines[0][:120]

#         # match
#         match = resume_matcher.match_resume(text)
#         matched_job = match.get("title")
#         score = match.get("score", 0.0)

#         # save db record
#         record = Resume(
#             filename=fname,
#             filepath=dest_path,
#             parsed_text=text,
#             email=email,
#             name=name,
#             matched_job=matched_job,
#             match_score=score,
#         )
#         session.add(record)
#         session.commit()
#         session.refresh(record)

#         # queue email based on score threshold
#         threshold = 0.3
#         selected = (score >= threshold)
#         email_sender.queue_result_email(background_tasks, email, selected, matched_job)

#         saved.append({"id": record.id, "filename": fname, "email": email, "matched_job": matched_job, "score": score})

#     return {"count": len(saved), "files": saved}











from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, BackgroundTasks
from sqlmodel import Session
from typing import List, Optional
import os
from ..database import get_session
from ..models import Resume, User
from ..utils.config import settings
from ..resume_parser_service import parser as resume_parser
from ..resume_parser_service import matcher as resume_matcher
from ..resume_parser_service import email_sender
from ..utils.auth_deps import get_current_user

router = APIRouter(prefix="/resumes", tags=["resumes"])

@router.post("/upload", summary="Upload JD and multiple resumes (protected)")
async def upload_resumes(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    jd_text: Optional[str] = Form(None),
    jd_file: Optional[UploadFile] = File(None),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a Job Description (JD) and multiple resumes to match against it.
    Either jd_text or jd_file must be provided.
    """
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # --- Parse the JD text/file ---
    if not jd_text and not jd_file:
        raise HTTPException(status_code=400, detail="Please provide either jd_text or jd_file")

    if jd_file:
        jd_filename = jd_file.filename.replace(" ", "_")
        jd_path = os.path.join(settings.UPLOAD_DIR, jd_filename)
        resume_parser.save_upload_file(jd_file, jd_path)
        jd_text = resume_parser.parse_resume(jd_path, jd_filename)

    jd_tokens = set(resume_matcher.extract_tokens(jd_text))

    if not jd_tokens:
        raise HTTPException(status_code=400, detail="Could not extract keywords from JD")

    # --- Process each resume ---
    results = []
    for upload in files:
        fname = upload.filename.replace(" ", "_")
        dest_path = os.path.join(settings.UPLOAD_DIR, fname)
        resume_parser.save_upload_file(upload, dest_path)

        text = resume_parser.parse_resume(dest_path, fname)

        import re
        m = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
        email = m.group(0) if m else None

        name = None
        first_lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
        if first_lines:
            name = first_lines[0][:120]

        # --- Match against JD tokens ---
        resume_tokens = set(resume_matcher.extract_tokens(text))
        matches = resume_tokens.intersection(jd_tokens)
        score = len(matches) / len(jd_tokens) if jd_tokens else 0.0

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

        selected = score >= 0.3
        email_sender.queue_result_email(background_tasks, email, selected, "Uploaded JD")

        results.append({
            "filename": fname,
            "email": email,
            "score": round(score, 2),
            "selected": selected
        })

    return {
        "jd_summary": jd_text[:300] + "..." if len(jd_text) > 300 else jd_text,
        "total_resumes": len(results),
        "results": results
    }
