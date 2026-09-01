from datetime import datetime

from pydantic import BaseModel, Field


class CaseQuestionnaireItem(BaseModel):
    question_id: int
    question_text: str
    answer_text: str | None = None


class CaseDocumentItem(BaseModel):
    id: int
    document_type: str
    file_name: str
    uploaded_at: datetime

    extraction_status: str | None = None
    extracted_text: str | None = None


class DoctorCaseResponse(BaseModel):
    session_id: int
    patient_id: int
    session_status: str

    started_at: datetime
    completed_at: datetime | None = None

    questionnaire: list[CaseQuestionnaireItem] = Field(
        default_factory=list
    )

    documents: list[CaseDocumentItem] = Field(
        default_factory=list
    )

    ai_extraction: dict | None = None