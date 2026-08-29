from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.patient import Patient
from app.models.patient_identifier import PatientIdentifier
from app.schemas.auth import (
    IdentityVerificationRequest,
    IdentityVerificationResponse
)
from app.services.identity_service import (
    hash_identifier,
    mock_verify_identifier
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post(
    "/verify",
    response_model=IdentityVerificationResponse
)
def verify_identity(
    request: IdentityVerificationRequest,
    db: Session = Depends(get_db)
):
    is_verified = mock_verify_identifier(
        request.identifier_type,
        request.identifier
    )

    if not is_verified:
        return IdentityVerificationResponse(
            verified=False,
            message="Identity verification failed"
        )

    identifier_hash = hash_identifier(request.identifier)

    existing_identifier = (
        db.query(PatientIdentifier)
        .filter(
            PatientIdentifier.identifier_hash
            == identifier_hash
        )
        .first()
    )

    if existing_identifier:
        existing_identifier.verification_status = "VERIFIED"
        existing_identifier.verified_at = datetime.utcnow()

        db.commit()

        return IdentityVerificationResponse(
            verified=True,
            patient_id=existing_identifier.patient_id,
            message="Identity verified"
        )

    return IdentityVerificationResponse(
        verified=True,
        message=(
            "Identity verified in development mode. "
            "Patient registration is required."
        )
    )