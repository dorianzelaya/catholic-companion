from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import pytz
import httpx
import re
from database import get_db
from services import fetch_daily_content
import models

router = APIRouter(prefix="/readings", tags=["readings"])

WIKI_HEADERS = {
    "User-Agent": "Commune Catholic App/1.0 (https://catholic-companion-production.up.railway.app; contact via github.com/dorianzelaya)",
    "Accept": "application/json",
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


def score_title(title, clean_name, name_parts):
    """Higher score = better match for an actual saint biography article."""
    t = title.lower()
    cn = clean_name.lower()

    bad_words = ['painting', 'church', 'cathedral', 'basilica', 'altarpiece',
                 '(film)', 'parish', 'school', 'university', 'hospital', 'island']
    if any(b in t for b in bad_words):
        return -1

    if not all(part in t for part in name_parts):
        return -1

    score = 0
    if t == cn:
        score += 100
    if t.startswith(cn):
        score += 50
    if 'saint' in t or t.startswith('st '):
        score += 20
    score += max(0, 40 - len(title))
    if ' and ' in t:
        score -= 30

    return score


@router.get("/saint-wiki")
async def get_saint_wiki(name: str, description: str = "", debug: bool = False):
    """Server-side proxy for Wikipedia so we can set a User-Agent header
    (browsers block custom User-Agent on fetch).
    Pass ?debug=true to see what actually happened."""

    trace = {}

    clean_name = re.sub(r'^(Saint|St\.|Blessed|Venerable)\s+', '', name, flags=re.IGNORECASE)
    clean_name = re.sub(r',.*$', '', clean_name).strip()
    trace["clean_name"] = clean_name

    name_parts = [w.lower() for w in clean_name.split() if len(w) > 3]
    trace["name_parts"] = name_parts

    context_words = ' '.join(description.split()[:5]) if description else 'Catholic saint'

    api_url = "https://en.wikipedia.org/w/api.php"

    def fail(reason):
        if debug:
            trace["failed_at"] = reason
            return {"text": None, "image": None, "debug": trace}
        return {"text": None, "image": None}

    async with httpx.AsyncClient(follow_redirects=True) as client:
        # --- Search ---
        search_params = {
            "action": "query",
            "list": "search",
            "srsearch": f"{clean_name} {context_words}",
            "format": "json",
            "srlimit": 8,
        }
        try:
            search_resp = await client.get(api_url, params=search_params, headers=WIKI_HEADERS, timeout=20)
        except Exception as e:
            return fail(f"search request threw: {type(e).__name__}: {e}")

        trace["search_status"] = search_resp.status_code
        if search_resp.status_code != 200:
            trace["search_body"] = search_resp.text[:300]
            return fail("search non-200")

        try:
            search_data = search_resp.json()
        except Exception as e:
            trace["search_body"] = search_resp.text[:300]
            return fail(f"search json parse: {e}")

        results = search_data.get("query", {}).get("search", [])
        trace["result_titles"] = [r["title"] for r in results]
        if not results:
            return fail("no search results")

        # --- Pick best ---
        best = None
        best_score = -1
        scores = {}
        for r in results:
            s = score_title(r["title"], clean_name, name_parts)
            scores[r["title"]] = s
            if s > best_score:
                best_score = s
                best = r
        trace["scores"] = scores

        # Fallback: if nothing scored, take the top search result outright
        if not best or best_score < 0:
            best = results[0]
            trace["fallback_used"] = True

        page_title = best["title"]
        trace["chosen_title"] = page_title

        # --- Content ---
        content_params = {
            "action": "query",
            "titles": page_title,
            "prop": "extracts|pageimages",
            "exintro": "true",
            "explaintext": "true",
            "piprop": "original",
            "redirects": 1,
            "format": "json",
        }
        try:
            content_resp = await client.get(api_url, params=content_params, headers=WIKI_HEADERS, timeout=20)
        except Exception as e:
            return fail(f"content request threw: {type(e).__name__}: {e}")

        trace["content_status"] = content_resp.status_code
        if content_resp.status_code != 200:
            trace["content_body"] = content_resp.text[:300]
            return fail("content non-200")

        try:
            content_data = content_resp.json()
        except Exception as e:
            return fail(f"content json parse: {e}")

        pages = content_data.get("query", {}).get("pages", {})
        if not pages:
            return fail("no pages in content response")

        page = list(pages.values())[0]
        extract = page.get("extract")
        trace["has_extract"] = bool(extract)
        trace["has_image"] = bool(page.get("original"))

        if not extract:
            return fail("page has no extract")
        if "may refer to:" in extract:
            return fail("disambiguation page")

        image = page.get("original", {}).get("source") if page.get("original") else None

        result = {"text": extract.strip(), "image": image}
        if debug:
            result["debug"] = trace
        return result