from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List
import re

from database import get_db
from auth import get_current_user
import models

router = APIRouter(prefix="/journal", tags=["journal"])

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
MAX_LEN = 5000


class JournalCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_LEN)
    # Local calendar date from the client, YYYY-MM-DD
    date: str


class JournalOut(BaseModel):
    id: int
    date: str
    text: str

    class Config:
        from_attributes = True


@router.get("", response_model=List[JournalOut])
def list_entries(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """All of the logged-in user's entries, newest first."""
    entries = (
        db.query(models.JournalEntry)
        .filter(models.JournalEntry.user_id == user.id)
        .order_by(
            models.JournalEntry.date.desc(),
            models.JournalEntry.id.desc(),
        )
        .all()
    )
    return entries


@router.post("", response_model=JournalOut, status_code=status.HTTP_201_CREATED)
def create_entry(
    payload: JournalCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Entry cannot be empty")

    if not DATE_RE.match(payload.date):
        raise HTTPException(status_code=400, detail="date must be YYYY-MM-DD")

    entry = models.JournalEntry(
        user_id=user.id,
        date=payload.date,
        text=text,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    entry = (
        db.query(models.JournalEntry)
        .filter(
            models.JournalEntry.id == entry_id,
            # Scoped to the owner, so one user cannot delete another's entry
            models.JournalEntry.user_id == user.id,
        )
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")

    db.delete(entry)
    db.commit()
    return None
