from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import secrets
import os

from database import get_db
import models
import schemas
import auth
from email_service import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["auth"])

# Where the reset link points. Set FRONTEND_URL in Railway env vars to
# your actual frontend domain. Falls back to localhost for local testing.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

RESET_TOKEN_EXPIRE_MINUTES = 30


def _is_expired(expires_at) -> bool:
    """
    Compares an expiry timestamp against now, whether the value coming back
    from the database is timezone-aware or naive.

    This matters more than it looks. datetime.utcnow() returns a NAIVE
    datetime, but a timezone-aware column returns an AWARE one, and Python
    raises TypeError when the two are compared. Inside a request that
    surfaces as a 500, and a 500 escapes before CORS headers are attached,
    so the browser reports a misleading "No Access-Control-Allow-Origin
    header" error instead of the real crash.
    """
    now = datetime.now(timezone.utc)

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    return expires_at < now


@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        first_name=user.first_name,
        email=user.email,
        hashed_password=auth.hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = auth.create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/forgot-password")
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Always returns success, whether or not the email exists. This is
    deliberate: telling a stranger "that email isn't registered" lets them
    enumerate which emails have accounts. Same response either way.
    """
    # Emails are matched case-insensitively. A user who registered as
    # Name@Gmail.com and typed name@gmail.com would otherwise silently
    # match nothing and get the same success message as everyone else.
    email_input = payload.email.strip().lower()

    user = (
        db.query(models.User)
        .filter(models.User.email.ilike(email_input))
        .first()
    )

    if not user:
        # Logged, not returned. The client response stays identical.
        print(f"[auth] forgot-password: no account matches {email_input}", flush=True)
        return {"message": "If that email is registered, a reset link has been sent."}

    # Invalidate any earlier unused tokens for this user so only the most
    # recent reset link works.
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.used == False,
    ).update({"used": True})

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)

    reset_token = models.PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at,
    )
    db.add(reset_token)
    db.commit()

    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"

    try:
        send_password_reset_email(user.email, user.first_name, reset_url)
    except Exception as e:
        # flush=True matters here. Railway buffers stdout, so an unflushed
        # print from inside a request handler may never appear in the logs.
        print(f"EMAIL SEND FAILED: {type(e).__name__}: {e}", flush=True)

    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    reset_token = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == payload.token,
        models.PasswordResetToken.used == False,
    ).first()

    if not reset_token:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has already been used.")

    if _is_expired(reset_token.expires_at):
        raise HTTPException(status_code=400, detail="This reset link has expired. Please request a new one.")

    user = db.query(models.User).filter(models.User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="This reset link is invalid.")

    user.hashed_password = auth.hash_password(payload.new_password)
    reset_token.used = True
    db.commit()

    return {"message": "Your password has been reset. You can now log in."}