from typing import List
import re

# Example job postings with keywords (in real app, jobs would be DB records)
JOB_DB = [
    {"id": "backend_dev", "title": "Backend Developer", "keywords": ["python", "fastapi", "sql", "api", "docker"]},
    {"id": "data_scientist", "title": "Data Scientist", "keywords": ["python", "pandas", "numpy", "ml", "scikit-learn"]},
    {"id": "frontend_dev", "title": "Frontend Developer", "keywords": ["javascript", "react", "html", "css", "typescript"]},
]

def extract_tokens(text: str) -> List[str]:
    tokens = re.findall(r"[A-Za-z0-9\+\#-]+", text.lower())
    return tokens

def score_against_job(parsed_text: str, job_keywords: List[str]) -> float:
    tokens = set(extract_tokens(parsed_text))
    keywords = set([k.lower() for k in job_keywords])
    if not keywords:
        return 0.0
    matches = tokens.intersection(keywords)
    return len(matches) / len(keywords)

def match_resume(parsed_text: str):
    best = {"job_id": None, "title": None, "score": 0.0}
    for job in JOB_DB:
        sc = score_against_job(parsed_text, job["keywords"])
        if sc > best["score"]:
            best.update({"job_id": job["id"], "title": job["title"], "score": sc})
    return best
