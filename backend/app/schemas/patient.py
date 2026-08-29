from datetime import date

from pydantic import BaseModel, Field


class PatientCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    date_of_birth: date | None = None
    gender: str | None = None
    phone: str | None = None
    preferred_language: str = Field(
        min_length=2,
        max_length=50
    )


class PatientResponse(BaseModel):
    id: int
    name: str
    date_of_birth: date | None
    gender: str | None
    phone: str | None
    preferred_language: str

    class Config:
        from_attributes = True