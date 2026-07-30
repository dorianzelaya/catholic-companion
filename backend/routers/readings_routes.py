from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import pytz
import httpx
from database import get_db
from services import fetch_daily_content
import models

router = APIRouter(prefix="/readings", tags=["readings"])

WIKI_HEADERS = {
    "User-Agent": "Commune Catholic App/1.0 (https://catholic-companion-production.up.railway.app)"
}

def get_us_eastern_date():
    eastern = pytz.timezone('America/New_York')
    return datetime.now(eastern).date()


@router.get("/today")
async def get_today_readings(db: Session = Depends(get_db)):
    today = get_us_eastern_date()
    today_str = today.strftime("%Y-%m-%d")

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

    try:
        content = await fetch_daily_content(today)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Could not fetch readings: {str(e)}")

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


@router.get("/saint-wiki")
async def get_saint_wiki(name: str, description: str = ""):
    """Server-side proxy for Wikipedia so we can set a User-Agent header
    (browsers block custom User-Agent on fetch)."""
    import re

    clean_name = re.sub(r'^(Saint|St\.|Blessed|Venerable)\s+', '', name, flags=re.IGNORECASE)
    clean_name = re.sub(r',.*$', '', clean_name).strip()

    name_parts = [w.lower() for w in clean_name.split() if len(w) > 3]

    context_words = ' '.join(description.split()[:5]) if description else 'Catholic saint'

    search_url = "https://en.wikipedia.org/w/api.php"
    search_params = {
        "action": "query",
        "list": "search",
        "srsearch": f"Saint {clean_name} {context_words}",
        "format": "json",
        "srlimit": 5,
    }

    async with httpx.AsyncClient() as client:
        try:
            search_resp = await client.get(search_url, params=search_params, headers=WIKI_HEADERS, timeout=15)
            if search_resp.status_code != 200:
                return {"text": None, "image": None}
            search_data = search_resp.json()

            results = search_data.get("query", {}).get("search", [])
            if not results:
                return {"text": None, "image": None}

            match = None
            for r in results:
                title = r["title"].lower()
                if name_parts and all(part in title for part in name_parts):
                    match = r
                    break

            if not match:
                return {"text": None, "image": None}

            page_title = match["title"]

            content_params = {
                "action": "query",
                "titles": page_title,
                "prop": "extracts|pageimages",
                "exintro": "true",
                "explaintext": "true",
                "piprop": "original",
                "format": "json",
            }

            content_resp = await client.get(search_url, params=content_params, headers=WIKI_HEADERS, timeout=15)
            if content_resp.status_code != 200:
                return {"text": None, "image": None}
            content_data = content_resp.json()

            pages = content_data.get("query", {}).get("pages", {})
            if not pages:
                return {"text": None, "image": None}

            page = list(pages.values())[0]
            extract = page.get("extract")
            if not extract or "may refer to:" in extract:
                return {"text": None, "image": None}

            image = page.get("original", {}).get("source") if page.get("original") else None

            return {
                "text": extract.strip(),
                "image": image
            }

        except Exception:
            return {"text": None, "image": None}