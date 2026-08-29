from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.patient import Patient
from app.models.patient_identifier import PatientIdentifier
from app.schemas.auth import (
    IdentityVerificationRequest,
    IdentityVerificationResponse,
    PatientRegistrationRequest,
    PatientRegistrationResponse,
)
from app.services.identity_service import (
    hash_identifier,
    mock_verify_identifier,
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


@router.post(
    "/register",
    response_model=PatientRegistrationResponse,
    status_code=201
)
def register_patient(
    request: PatientRegistrationRequest,
    db: Session = Depends(get_db)
):
    # 1. Verify identity
    is_verified = mock_verify_identifier(
        request.identifier_type,
        request.identifier
    )

    if not is_verified:
        raise HTTPException(
            status_code=401,
            detail="Identity verification failed"
        )

    # 2. Hash identifier
    identifier_hash = hash_identifier(
        request.identifier
    )

    # 3. Check whether identifier already exists
    existing_identifier = (
        db.query(PatientIdentifier)
        .filter(
            PatientIdentifier.identifier_hash
            == identifier_hash
        )
        .first()
    )

    if existing_identifier:
        return PatientRegistrationResponse(
            verified=True,
            patient_id=existing_identifier.patient_id,
            message="Patient already registered"
        )

    # 4. Create patient
    patient = Patient(
        name=request.name,
        date_of_birth=request.date_of_birth,
        gender=request.gender,
        phone=request.phone,
        preferred_language=request.preferred_language
    )

    db.add(patient)
    db.flush()

    # 5. Link identifier to patient
    patient_identifier = PatientIdentifier(
        patient_id=patient.id,
        identifier_type=request.identifier_type,
        identifier_hash=identifier_hash,
        verification_status="VERIFIED",
        verified_at=datetime.utcnow()
    )

    db.add(patient_identifier)

    # 6. Commit both records together
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to register patient"
        )

    db.refresh(patient)

    return PatientRegistrationResponse(
        verified=True,
        patient_id=patient.id,
        message="Patient registered successfully"
    )