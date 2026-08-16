# Commune

A Catholic devotional Progressive Web App for daily prayer, scripture, and the liturgical life of the Church. Built solo, full-stack.

**Live app: [commune-catholic.up.railway.app](https://commune-catholic.up.railway.app)**

---

## What it is

Commune brings the daily rhythm of Catholic prayer into a single, fast, installable app. Each day it pulls the Mass readings and the saint or feast of the day from the liturgical calendar, pairs them with the full Douay-Rheims scripture text, and presents them alongside the Rosary, traditional prayers, an examination of conscience, and a searchable Bible. It installs to a phone home screen like a native app, with no app store required.

It's designed to feel calm and unhurried rather than busy, which is why it leans on a single crimson palette, serif type, and quiet transitions instead of the dense feature-grids common to devotional apps.

## Screenshots

<!--
Add screenshots here. Recommended: 4 images, roughly 300px wide each, in a
row. Save the PNGs into a `docs/screenshots/` folder in the repo, then the
paths below will resolve. Suggested captures: Home, Bible reader, Seek
(scripture-for-a-struggle), Rosary.
-->

| Home | Bible | Seek | Rosary |
|------|-------|------|--------|
| ![Home](docs/screenshots/home.png) | ![Bible](docs/screenshots/bible.png) | ![Seek](docs/screenshots/seek.png) | ![Rosary](docs/screenshots/rosary.png) |

## Features

- **Daily Mass readings** — first reading, psalm, second reading, and gospel, each pulled by liturgical reference and rendered with the complete Douay-Rheims text. Handles the awkward citation formats real lectionaries use, including semicolon chapter-jumps and partial-verse letter suffixes (e.g. `Revelation 11:19a; 12:1-6a, 10ab`).
- **Saint or feast of the day** — sourced from the liturgical calendar, enriched with a biography and image pulled live from Wikipedia through a proxy with an explicit title-mapping layer for the many cases where the liturgical name and the article title don't match.
- **Full Catholic Bible** — all 73 books in the Douay-Rheims translation, with chapter caching, swipe navigation, saved verses, mark-as-read, and reading-position persistence.
- **The Rosary** — a guided, mystery-by-mystery walkthrough with sacred art for each mystery and progress tracking through all decades.
- **Seek** — scripture curated by life situation. Pick what you're facing (family conflict, anxiety, hope) and get relevant verses plus a saint who lived it.
- **Traditional prayers & examination of conscience** — the core prayers of the faith and a guided examination.
- **Personal profile** — daily prayer streak, a prayer journal saved to your account, saved verses, and a reading plan.

## Tech stack

**Frontend**
- React (Vite)
- React Router
- Custom CSS (crimson / liquid-glass theme, no UI framework)
- PWA: installable, offline-aware, service worker

**Backend**
- FastAPI (Python)
- PostgreSQL via SQLAlchemy
- JWT authentication with sliding token expiration
- Async HTTP (httpx) for external data sources

**Infrastructure**
- Deployed on Railway (separate frontend and backend services)
- Transactional email via Resend (password reset)

**External data sources**
- Douay-Rheims scripture API
- A liturgical readings & calendar API
- Wikipedia (saint biographies and images)

## Architecture

Two services, deployed independently.

The **backend** is a FastAPI app organized into routers by domain — auth, readings, bible, journal, user, and a "struggle"/Seek router. On the first request for a given day, it fetches that day's readings and calendar entry from external APIs, parses each scripture reference into structured chapter-and-verse ranges, fetches the corresponding Douay-Rheims text, and caches the assembled result in Postgres so every later request that day is a single fast read.

The **reference parser** is the piece that took the most care. Lectionary citations are irregular — they use three different dash characters interchangeably for cross-chapter ranges, mark partial verses with trailing letters, and stitch together non-contiguous passages across chapters with semicolons. The parser normalizes all of it into clean `(start, end)` verse ranges before any text is fetched.

The **frontend** is a single-page React app. Day-specific content (readings, saint) is cached in `localStorage` with a date key and a version number, so the app opens instantly on repeat visits and only re-fetches when the day rolls over or the caching logic itself changes.

Auth is JWT-based with sliding expiration: an active user's session refreshes automatically, while an idle one expires. Every content route requires a valid token.

## Running it locally

> The live app is the intended way to use Commune. These steps are for developers who want to run it themselves.

**Prerequisites:** Node.js 18+, Python 3.11+, and a PostgreSQL database.

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` in `backend/` with:

```
DATABASE_URL=postgresql://user:password@localhost:5432/commune
JWT_SECRET=your-secret-here
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=your-resend-key      # optional, only needed for password reset
```

Then:

```bash
uvicorn main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend URL in `frontend/src/config.js`. Point it at `http://localhost:8000` for local development.

## Status

Commune is at its v1 release: a fully working, installable PWA. A native build for the app stores (via PWABuilder) is planned.

## License

Copyright © 2026 Dorian Zelaya. All rights reserved.

This source is published for review and portfolio purposes. It is **not** open source. You may read the code, but you may not copy, modify, redistribute, deploy, or use it, in whole or in part, without the author's written permission. See [LICENSE](LICENSE) for the full terms.

## Author

Built by Dorian Zelaya, a computer science student at California State University, Long Beach.
