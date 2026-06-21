import httpx
from datetime import date


async def fetch_daily_content(target_date: date) -> dict:
    date_str = target_date.strftime("%Y-%m-%d")
    year = target_date.year
    month_day = target_date.strftime("%m-%d")

    readings_url = f"https://cpbjr.github.io/catholic-readings-api/readings/{year}/{month_day}.json"
    calendar_url = f"https://cpbjr.github.io/catholic-readings-api/liturgical-calendar/{year}/{month_day}.json"

    async with httpx.AsyncClient() as client:
        readings_response = await client.get(readings_url)
        calendar_response = await client.get(calendar_url)

    readings_data = readings_response.json() if readings_response.status_code == 200 else {}
    calendar_data = calendar_response.json() if calendar_response.status_code == 200 else {}

    return {
        "date": date_str,
        "liturgical_season": calendar_data.get("season"),
        "first_reading_ref": readings_data.get("firstReading", {}).get("reference"),
        "first_reading_text": readings_data.get("firstReading", {}).get("text"),
        "psalm_ref": readings_data.get("psalm", {}).get("reference"),
        "psalm_text": readings_data.get("psalm", {}).get("text"),
        "second_reading_ref": readings_data.get("secondReading", {}).get("reference"),
        "second_reading_text": readings_data.get("secondReading", {}).get("text"),
        "gospel_ref": readings_data.get("gospel", {}).get("reference"),
        "gospel_text": readings_data.get("gospel", {}).get("text"),
        "saint_name": calendar_data.get("name"),
        "saint_type": calendar_data.get("type"),
        "saint_description": calendar_data.get("description"),
    }