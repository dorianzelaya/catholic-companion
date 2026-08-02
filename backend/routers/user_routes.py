from fastapi import APIRouter, Depends
from pydantic import BaseModel

from auth import get_current_user
import models

# Same prefix as auth_routes — FastAPI allows multiple routers to share one.
router = APIRouter(prefix="/auth", tags=["auth"])


class MeOut(BaseModel):
    id: int
    first_name: str
    email: str

    class Config:
        from_attributes = True


@router.get("/me", response_model=MeOut)
def read_me(user: models.User = Depends(get_current_user)):
    """Return the logged-in user. Used by the frontend to populate the
    account card, which previously always showed a placeholder."""
    return user
