from pydantic import BaseModel, Field
from datetime import datetime


class AIClinicalExtraction(BaseModel):

    chief_complaint: str | None = None

    symptoms: list[str] = Field(
        default_factory=list
    )

    duration: str | None = None

    severity: str | None = None

    fever: str | None = None

    current_medications: list[str] = Field(
        default_factory=list
    )

    allergies: list[str] = Field(
        default_factory=list
    )

    existing_conditions: list[str] = Field(
        default_factory=list
    )

    past_medical_history: list[str] = Field(
        default_factory=list
    )

    additional_information: str | None = None


class AIExtractionResponse(BaseModel):

    id: int
    session_id: int
    source_text: str | None
    extracted_data: AIClinicalExtraction | None
    extraction_status: str
    model_name: str | None
    created_at: datetime
    updated_at: datetime
    reviewed_at: datetime | None = None
    verified_at: datetime | None = None

    class Config:
        from_attributes = True


class AIExtractionUpdate(BaseModel):
    extracted_data: AIClinicalExtraction


class AIExtractionApproval(BaseModel):
    status: str