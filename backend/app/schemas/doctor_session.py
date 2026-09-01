from datetime import datetime

from pydantic import BaseModel


class DoctorPatientSummary(BaseModel):
    id: int
    name: str
    age: int | None = None
    gender: str | None = None


class ClinicalSummaryPreview(BaseModel):
    chief_complaint: str | None = None
    symptom_duration: str | None = None


class DoctorSessionListItem(BaseModel):
    session_id: int
    patient: DoctorPatientSummary

    status: str
    priority: str
    token: str | None = None

    clinical_summary: ClinicalSummaryPreview

    started_at: datetime
    completed_at: datetime | None = None