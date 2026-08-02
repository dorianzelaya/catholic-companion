from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

from fastapi import Depends, HTTPException, status, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
import models

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"

# Inactivity window. A user who opens the app at least once inside this
# period is silently re-issued a fresh token and never has to log in again.
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30  # 30 days

# Re-issue once a token has been in use longer than this, rather than on
# every single request.
REFRESH_AFTER_MINUTES = 60 * 24  # 1 day

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
    response: Response,
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

    # --- Sliding expiration ---
    # If the token is more than REFRESH_AFTER_MINUTES from being fresh,
    # hand back a new one. The frontend swaps it in transparently, so an
    # active user is never logged out, while an abandoned session still
    # expires after ACCESS_TOKEN_EXPIRE_MINUTES of no use.
    try:
        exp = payload.get("exp")
        if exp is not None:
            remaining = datetime.utcfromtimestamp(exp) - datetime.utcnow()
            full_life = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            used = full_life - remaining
            if used > timedelta(minutes=REFRESH_AFTER_MINUTES):
                # Reuse the original claims so we don't have to guess the
                # payload shape that login produced.
                claims = {k: v for k, v in payload.items() if k != "exp"}
                response.headers["X-Refresh-Token"] = create_access_token(claims)
    except Exception:
        # Never let refresh problems block an otherwise valid request
        pass

    return user