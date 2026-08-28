from fastapi import FastAPI

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