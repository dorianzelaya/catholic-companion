"""
Audit saint -> Wikipedia matching for every day of the year.

Hits Wikipedia directly (no auth) and replicates the backend's matching
logic, so the numbers reflect the algorithm rather than the API gateway.

Run from the backend folder with the venv active:
    python audit_saints.py
"""
import datetime
import re
import httpx

CAL = "https://cpbjr.github.io/catholic-readings-api/liturgical-calendar/2026"
WIKI_API = "https://en.wikipedia.org/w/api.php"
HEADERS = {
    "User-Agent": "Commune Catholic App/1.0 (https://catholic-companion-production.up.railway.app)",
    "Accept": "application/json",
}

SKIP_TYPES = {"FERIA", "SUNDAY", "SOLEMNITY", "HOLY_WEEK", "TRIDUUM"}


def clean_saint_name(name: str) -> str:
    n = re.sub(r'^(Saint|St\.?|Blessed|Bl\.?|Venerable|Pope)\s+', '', name.strip(), flags=re.IGNORECASE)
    n = re.sub(r',.*$', '', n)
    n = re.sub(r'\s+', ' ', n)
    return n.strip()


def title_candidates(clean: str):
    return [clean, f"Saint {clean}", f"{clean} (saint)"]


def fetch_page(client, title):
    params = {
        "action": "query", "titles": title,
        "prop": "extracts|pageimages", "exintro": "true",
        "explaintext": "true", "piprop": "original",
        "redirects": 1, "format": "json",
    }
    try:
        r = client.get(WIKI_API, params=params, headers=HEADERS, timeout=20)
        if r.status_code != 200:
            return None, None
        pages = r.json().get("query", {}).get("pages", {})
        if not pages:
            return None, None
        page = list(pages.values())[0]
        if "missing" in page:
            return None, None
        extract = page.get("extract")
        if not extract or "may refer to:" in extract:
            return None, None
        img = page.get("original", {}).get("source") if page.get("original") else None
        return extract, img
    except Exception:
        return None, None


results = []
d = datetime.date(2026, 1, 1)
client = httpx.Client(follow_redirects=True)

while d.year == 2026:
    md = d.strftime("%m-%d")
    d += datetime.timedelta(days=1)
    try:
        data = client.get(f"{CAL}/{md}.json", timeout=15).json()
    except Exception:
        continue

    cel = data.get("celebration") or {}
    name = cel.get("name") or ""
    stype = (cel.get("type") or "").upper()
    api_image = cel.get("image") or ""

    if not name or stype in SKIP_TYPES:
        continue

    clean = clean_saint_name(name)
    hit_title = None
    for cand in title_candidates(clean):
        text, img = fetch_page(client, cand)
        if text:
            hit_title = cand
            break

    results.append({
        "date": md, "name": name, "type": stype,
        "clean": clean, "wiki_title": hit_title,
        "api_image": bool(api_image),
    })

client.close()

total = len(results)
wiki_ok = sum(1 for r in results if r["wiki_title"])
has_img = sum(1 for r in results if r["api_image"])
covered = sum(1 for r in results if r["wiki_title"] or r["api_image"])

print("=" * 64)
print(f"Saint days checked:        {total}")
print(f"Wikipedia title matched:   {wiki_ok}  ({100*wiki_ok/total:.0f}%)")
print(f"Calendar supplies image:   {has_img}  ({100*has_img/total:.0f}%)")
print(f"Covered by either:         {covered}  ({100*covered/total:.0f}%)")
print(f"NOTHING AT ALL:            {total-covered}")
print("=" * 64)

print("\n--- NEEDS A MANUAL WIKIPEDIA TITLE (no match, no api image) ---")
for r in results:
    if not r["wiki_title"] and not r["api_image"]:
        print(f'    "{r["name"]}": "",   # {r["date"]}  tried: {r["clean"]}')

print("\n--- NO WIKI MATCH BUT HAS API IMAGE (lower priority) ---")
for r in results:
    if not r["wiki_title"] and r["api_image"]:
        print(f'    "{r["name"]}": "",   # {r["date"]}  tried: {r["clean"]}')