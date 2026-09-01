from datetime import datetime

from pydantic import BaseModel


class DocumentExtractionResponse(BaseModel):
    id: int
    document_id: int

    extracted_text: str | None
    extraction_status: str
    extraction_engine: str | None

    extracted_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentExtractionUpdate(BaseModel):
    extracted_text: str