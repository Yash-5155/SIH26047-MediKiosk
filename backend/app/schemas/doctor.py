from datetime import date, datetime
from app.schemas.doctor_case import DoctorCaseResponse
from pydantic import BaseModel


class DoctorPatientResponse(BaseModel):
    id: int
    name: str
    date_of_birth: date | None = None
    gender: str | None = None
    phone: str | None = None
    preferred_language: str

    class Config:
        from_attributes = True


class DoctorSessionResponse(BaseModel):
    session_id: int
    status: str
    started_at: datetime
    completed_at: datetime | None = None
    patient: DoctorPatientResponse
    responses: list[DoctorCaseResponse]

    class Config:
        from_attributes = True

class DoctorSessionListItem(BaseModel):
    session_id: int
    patient_name: str
    status: str
    started_at: datetime
    completed_at: datetime | None