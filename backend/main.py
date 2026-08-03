from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth_routes
from routers import readings_routes
from routers import struggle_routes
from routers.bible_routes import router as bible_router
import models
from routers.journal_routes import router as journal_router
from routers.user_routes import router as user_router


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://catholic-companion-production.up.railway.app",
    ],
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


@app.get("/")
def root():
    return {"message": "Catholic Companion API is running"}