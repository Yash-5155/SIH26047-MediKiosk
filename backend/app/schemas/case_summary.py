from datetime import date, datetime

from pydantic import BaseModel


class CasePatient(BaseModel):
    id: int
    name: str
    date_of_birth: date | None = None
    gender: str | None = None
    preferred_language: str


class ClinicalSummary(BaseModel):
    chief_complaint: str | None = None
    symptom_duration: str | None = None
    severity: str | None = None
    has_fever: str | None = None
    existing_conditions: str | None = None
    current_medications: str | None = None
    allergies: str | None = None
    past_medical_history: str | None = None
    pain_level: str | None = None
    additional_information: str | None = None


class CaseSummaryResponse(BaseModel):
    session_id: int
    status: str
    started_at: datetime
    completed_at: datetime | None

    patient: CasePatient
    clinical_summary: ClinicalSummary