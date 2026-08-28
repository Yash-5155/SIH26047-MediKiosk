from fastapi import FastAPI
from sqlalchemy import text

from app.database.connection import engine

app = FastAPI(
    title="MediKiosk API",
    description="Backend API for SIH26047 MediKiosk",
    version="0.1.0"
)


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