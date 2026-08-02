from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
import models

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT. Raises JWTError if invalid or expired."""
    return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    """Resolve the logged-in user from the Authorization: Bearer <token> header.

    Accepts several common token payload shapes so it works regardless of
    what create_access_token() was called with:
      {"sub": "<email>"}  |  {"sub": "<user id>"}  |  {"user_id": <id>}
    """
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None or not credentials.credentials:
        raise unauthorized

    try:
        payload = decode_access_token(credentials.credentials)
    except JWTError:
        raise unauthorized

    user = None

    # Explicit user_id claim
    user_id = payload.get("user_id") or payload.get("id")
    if user_id is not None:
        user = db.query(models.User).filter(models.User.id == int(user_id)).first()

    # Standard "sub" claim — may hold an email or a numeric id
    if user is None:
        sub = payload.get("sub")
        if sub is not None:
            sub = str(sub)
            if sub.isdigit():
                user = db.query(models.User).filter(models.User.id == int(sub)).first()
            else:
                user = db.query(models.User).filter(models.User.email == sub).first()

    # Fallback: explicit email claim
    if user is None:
        email = payload.get("email")
        if email:
            user = db.query(models.User).filter(models.User.email == email).first()

    if user is None:
        raise unauthorized

    return user
