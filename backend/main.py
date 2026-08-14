from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth_routes
from routers import readings_routes
from routers import struggle_routes
from routers import debug_routes
from routers.bible_routes import router as bible_router
import models
from routers.journal_routes import router as journal_router
from routers.user_routes import router as user_router


Base.metadata.create_all(bind=engine)

app = FastAPI()

# The reset link's domain comes from FRONTEND_URL on the backend service,
# which is a different setting than API_URL in frontend/src/config.js. If
# those two ever disagree, the reset page loads on a domain the browser
# then refuses to let call the API, and Safari reports the blocked request
# as "Load failed" with no further detail.
#
# allow_origin_regex covers every Railway subdomain, so a domain rename or
# a stale FRONTEND_URL no longer breaks the app. Auth is bearer-token
# based, not cookie based, so this is not widening a session attack
# surface. Tighten to an explicit list once the domain is final.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://djzcommune.up.railway.app",
    ],
    allow_origin_regex=r"https://.*\.up\.railway\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Refresh-Token"],
)

app.include_router(auth_routes.router)
app.include_router(readings_routes.router)
app.include_router(struggle_routes.router)
app.include_router(bible_router)
app.include_router(journal_router)
app.include_router(user_router)

# Temporary diagnostic routes. Delete this line and the debug_routes
# import above once the email work is finished.
app.include_router(debug_routes.router)


@app.get("/")
def root():
    return {"message": "Catholic Companion API is running"}