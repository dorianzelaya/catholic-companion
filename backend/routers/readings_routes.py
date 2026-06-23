from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
from services import fetch_daily_content
import models

router = APIRouter(prefix="/readings", tags=["readings"])


@router.get("/today")
async def get_today_readings(db: Session = Depends(get_db)):
    today = date.today()
    today_str = today.strftime("%Y-%m-%d")

    # Check if we already have today's content cached in the database
    cached = db.query(models.DailyContent).filter(
        models.DailyContent.date == today_str
    ).first()

    if cached:
        return {
            "date": cached.date,
            "liturgical_season": cached.liturgical_season,
            "first_reading_ref": cached.first_reading_ref,
            "first_reading_text": cached.first_reading_text,
            "psalm_ref": cached.psalm_ref,
            "psalm_text": cached.psalm_text,
            "second_reading_ref": cached.second_reading_ref,
            "second_reading_text": cached.second_reading_text,
            "gospel_ref": cached.gospel_ref,
            "gospel_text": cached.gospel_text,
            "saint_name": cached.saint_name,
            "saint_type": cached.saint_type,
            "saint_description": cached.saint_description,
            "saint_quote": cached.saint_quote,
        }

    # Not cached — fetch from external APIs
    try:
        content = await fetch_daily_content(today)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Could not fetch readings: {str(e)}")

    # Save to database for subsequent requests today
    db_content = models.DailyContent(
        date=content["date"],
        liturgical_season=content["liturgical_season"],
        first_reading_ref=content["first_reading_ref"],
        first_reading_text=content["first_reading_text"],
        psalm_ref=content["psalm_ref"],
        psalm_text=content["psalm_text"],
        second_reading_ref=content["second_reading_ref"],
        second_reading_text=content["second_reading_text"],
        gospel_ref=content["gospel_ref"],
        gospel_text=content["gospel_text"],
        saint_name=content["saint_name"],
        saint_type=content["saint_type"],
        saint_description=content["saint_description"],
        saint_quote=content.get("saint_quote"),
    )

    db.add(db_content)
    db.commit()
    db.refresh(db_content)

    return content