from datetime import date, datetime

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


class DoctorCaseResponse(BaseModel):
    question_key: str
    question: str
    answer: str | None = None
    input_mode: str


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