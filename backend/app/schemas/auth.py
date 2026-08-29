from typing import Literal

from pydantic import BaseModel, Field


class IdentityVerificationRequest(BaseModel):
    identifier_type: Literal["AADHAAR", "ABHA"]
    identifier: str = Field(min_length=4, max_length=100)


class IdentityVerificationResponse(BaseModel):
    verified: bool
    patient_id: int | None = None
    message: str