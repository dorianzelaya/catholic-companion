from fastapi import APIRouter, HTTPException
import httpx
from reference_parser import strip_markup

router = APIRouter(prefix="/bible", tags=["bible"])

@router.get("/chapter/{book}/{chapter}")
async def get_chapter(book: str, chapter: int):
    url = f"https://thedouayrheims.com/api/chapter/{book}/{chapter}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=15)

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail=f"Book '{book}' chapter {chapter} not found")
    if response.status_code != 200:
        raise HTTPException(status_code=503, detail="Could not fetch Bible chapter")

    data = response.json()

    verses = []
    for v in data.get("verses", []):
        verses.append({
            "verse": v["verse"],
            "text": strip_markup(v["text"])
        })

    return {
        "book": book,
        "book_title": data.get("book_title", ""),
        "chapter": chapter,
        "verse_count": data.get("verse_count", len(verses)),
        "verses": verses
    }
