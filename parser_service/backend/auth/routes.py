from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from ..database import get_session
from .schemas import UserCreate, Token, UserRead
from . import crud
from ..utils.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=UserRead)
def signup(payload: UserCreate, session: Session = Depends(get_session)):
    existing = crud.get_user_by_email(session, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.create_user(session, payload.email, payload.password, payload.full_name)
    return user

@router.post("/login", response_model=Token)
def login(payload: UserCreate, session: Session = Depends(get_session)):
    user = crud.authenticate_user(session, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=str(user.id))
    return {"access_token": token, "token_type": "bearer"}
