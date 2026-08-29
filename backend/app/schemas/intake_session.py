from datetime import datetime

from pydantic import BaseModel


class IntakeSessionCreate(BaseModel):
    patient_id: int


class IntakeSessionResponse(BaseModel):
    id: int
    patient_id: int
    status: str
    started_at: datetime
    completed_at: datetime | None

    class Config:
        from_attributes = True