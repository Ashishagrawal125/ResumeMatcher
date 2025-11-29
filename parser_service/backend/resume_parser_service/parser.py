import os
from pdfminer.high_level import extract_text
from docx import Document
from ..utils.config import settings

def save_upload_file(upload_file, destination: str):
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    with open(destination, "wb") as buffer:
        buffer.write(upload_file.file.read())

def parse_pdf(file_path: str) -> str:
    try:
        text = extract_text(file_path)
        return text or ""
    except Exception:
        return ""

def parse_docx(file_path: str) -> str:
    try:
        doc = Document(file_path)
        full = []
        for p in doc.paragraphs:
            full.append(p.text)
        return "\n".join(full)
    except Exception:
        return ""

def parse_text(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

def parse_resume(file_path: str, filename: str) -> str:
    ext = filename.lower().split(".")[-1]
    if ext == "pdf":
        return parse_pdf(file_path)
    if ext in ("docx", "doc"):
        return parse_docx(file_path)
    if ext in ("txt",):
        return parse_text(file_path)
    # fallback attempt: try pdf then docx
    text = parse_pdf(file_path)
    if text.strip():
        return text
    return parse_docx(file_path)
