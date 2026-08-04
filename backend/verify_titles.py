"""
Verify every title in SAINT_TITLES actually resolves on Wikipedia,
and report whether each returns a summary and an image.

Run from the backend folder with the venv active:
    python verify_titles.py
"""
import httpx
from saint_titles import SAINT_TITLES

WIKI_API = "https://en.wikipedia.org/w/api.php"
HEADERS = {
    "User-Agent": "Commune Catholic App/1.0 (https://catholic-companion-production.up.railway.app)",
    "Accept": "application/json",
}

client = httpx.Client(follow_redirects=True)

bad, no_image, good = [], [], 0

for cal_name, title in SAINT_TITLES.items():
    params = {
        "action": "query", "titles": title,
        "prop": "extracts|pageimages", "exintro": "true",
        "explaintext": "true", "piprop": "original",
        "redirects": 1, "format": "json",
    }
    try:
        r = client.get(WIKI_API, params=params, headers=HEADERS, timeout=20)
        pages = r.json().get("query", {}).get("pages", {})
        page = list(pages.values())[0] if pages else {}
    except Exception as e:
        bad.append((cal_name, title, type(e).__name__))
        continue

    extract = page.get("extract")
    has_img = bool(page.get("original"))

    if "missing" in page or not extract:
        bad.append((cal_name, title, "no article/extract"))
    elif "may refer to:" in extract:
        bad.append((cal_name, title, "disambiguation page"))
    elif not has_img:
        no_image.append((cal_name, title))
        good += 1
    else:
        good += 1

client.close()

total = len(SAINT_TITLES)
print("=" * 64)
print(f"Mapped entries:            {total}")
print(f"Resolve with summary:      {good}")
print(f"BROKEN (need a new title): {len(bad)}")
print(f"Summary but no image:      {len(no_image)}")
print("=" * 64)

if bad:
    print("\n--- BROKEN, FIX THESE ---")
    for cal, title, why in bad:
        print(f'  {why:22s} "{title}"\n      from: {cal}')

if no_image:
    print("\n--- TEXT ONLY, NO IMAGE ---")
    for cal, title in no_image:
        print(f'  "{title}"  <- {cal}')
