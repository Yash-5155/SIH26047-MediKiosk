from fastapi import FastAPI
from sqlalchemy import text

from app.api.sessions import router as sessions_router
from app.database.connection import engine
from app.api.patients import router as patients_router
from app.api.auth import router as auth_router
from app.api.questionnaire import router as questionnaire_router
from app.api.doctor import router as doctor_router
from app.api.documents import router as documents_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="MediKiosk API",
    description="Backend API for SIH26047 MediKiosk",
    version="0.1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients_router)
app.include_router(sessions_router)
app.include_router(auth_router)
app.include_router(questionnaire_router)
app.include_router(doctor_router)
app.include_router(documents_router)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "MediKiosk API"
    }


@app.get("/health/database")
def database_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "error",
            "database": "connection failed",
            "details": str(e)
        }