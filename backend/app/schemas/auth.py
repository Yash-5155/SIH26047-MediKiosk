from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


class IdentityVerificationRequest(BaseModel):
    identifier_type: Literal["AADHAAR", "ABHA"]
    identifier: str = Field(min_length=4, max_length=100)


class IdentityVerificationResponse(BaseModel):
    verified: bool
    patient_id: int | None = None
    message: str


class PatientRegistrationRequest(BaseModel):
    identifier_type: Literal["AADHAAR", "ABHA"]
    identifier: str = Field(min_length=4, max_length=100)

    name: str = Field(min_length=2, max_length=100)
    date_of_birth: date | None = None
    gender: str | None = None
    phone: str | None = None
    preferred_language: str = Field(
        min_length=2,
        max_length=50
    )


class PatientRegistrationResponse(BaseModel):
    verified: bool
    patient_id: int
    message: str