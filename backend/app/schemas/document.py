from datetime import datetime

from pydantic import BaseModel


class MedicalDocumentResponse(BaseModel):
    id: int
    patient_id: int
    session_id: int | None

    document_type: str
    file_name: str
    file_path: str

    uploaded_at: datetime

    class Config:
        from_attributes = True