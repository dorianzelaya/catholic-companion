import httpx
from datetime import date
from reference_parser import parse_reference, strip_markup
from book_mapper import get_slug
from psalm_converter import convert_psalm_reference


async def fetch_verse_text(book_slug: str, chapter: int, verse_ranges: list) -> str:
    """
    Fetches verse text from the Douay-Rheims API for a given book, chapter,
    and list of verse ranges. Returns a single clean string of the passage.
    """
    url = f"https://thedouayrheims.com/api/chapter/{book_slug}/{chapter}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    if response.status_code != 200:
        return ""

    data = response.json()
    verses = {v["verse"]: v["text"] for v in data.get("verses", [])}

    collected = []
    for start, end in verse_ranges:
        for verse_num in range(start, end + 1):
            text = verses.get(verse_num, "")
            if text:
                collected.append(strip_markup(text))

    return " ".join(collected)


async def fetch_reading_text(reference: str) -> str:
    """
    Takes a raw USCCB reference string like "Matthew 6:24-34" and returns
    the full clean verse text from the Douay-Rheims API.
    """
    if not reference:
        return ""

    try:
        parsed = parse_reference(reference)
        book = parsed["book"]
        chapter = parsed["chapter"]
        verse_ranges = parsed["verse_ranges"]
        cross_chapter_end = parsed.get("cross_chapter_end")

        # Handle psalm number conversion
        if book in ("Psalm", "Psalms"):
            first_verse = verse_ranges[0][0]
            conversion = convert_psalm_reference(chapter, first_verse)
            chapter = conversion["vulgate_number"]
            offset = conversion["verse_offset"]
            if offset != 0:
                verse_ranges = [(s + offset, e + offset) for s, e in verse_ranges]

        slug = get_slug(book)

        if cross_chapter_end:
            # Fetch from start verse to end of first chapter, then start of next chapter to end verse
            end_chapter, end_verse = cross_chapter_end
            start_verse = verse_ranges[0][0]

            first_part = await fetch_verse_text(slug, chapter, [(start_verse, 999)])
            second_part = await fetch_verse_text(slug, end_chapter, [(1, end_verse)])

            return f"{first_part} {second_part}".strip()

        return await fetch_verse_text(slug, chapter, verse_ranges)

    except (ValueError, NotImplementedError) as e:
        return f"[Reading unavailable: {str(e)}]"


async def fetch_daily_content(target_date: date) -> dict:
    """
    Fetches today's readings and saint data, combines references
    with full verse text, and returns a clean structured dict.
    """
    year = target_date.year
    month_day = target_date.strftime("%m-%d")

    readings_url = f"https://cpbjr.github.io/catholic-readings-api/readings/{year}/{month_day}.json"
    calendar_url = f"https://cpbjr.github.io/catholic-readings-api/liturgical-calendar/{year}/{month_day}.json"

    async with httpx.AsyncClient() as client:
        readings_response = await client.get(readings_url)
        calendar_response = await client.get(calendar_url)

    readings_data = readings_response.json() if readings_response.status_code == 200 else {}
    calendar_data = calendar_response.json() if calendar_response.status_code == 200 else {}

    readings = readings_data.get("readings", {})

    first_reading_ref = readings.get("firstReading")
    psalm_ref = readings.get("psalm")
    second_reading_ref = readings.get("secondReading")
    gospel_ref = readings.get("gospel")

    first_reading_text = await fetch_reading_text(first_reading_ref) if first_reading_ref else ""
    psalm_text = await fetch_reading_text(psalm_ref) if psalm_ref else ""
    second_reading_text = await fetch_reading_text(second_reading_ref) if second_reading_ref else ""
    gospel_text = await fetch_reading_text(gospel_ref) if gospel_ref else ""

    celebration = calendar_data.get("celebration", {})

    return {
        "date": target_date.strftime("%Y-%m-%d"),
        "liturgical_season": readings_data.get("season") or calendar_data.get("season"),
        "first_reading_ref": first_reading_ref,
        "first_reading_text": first_reading_text,
        "psalm_ref": psalm_ref,
        "psalm_text": psalm_text,
        "second_reading_ref": second_reading_ref,
        "second_reading_text": second_reading_text,
        "gospel_ref": gospel_ref,
        "gospel_text": gospel_text,
        "saint_name": celebration.get("name"),
        "saint_type": celebration.get("type"),
        "saint_description": celebration.get("description"),
        "saint_quote": celebration.get("quote"),
    }