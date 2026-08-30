from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.intake_session import IntakeSession
from app.models.patient import Patient
from app.schemas.intake_session import (
    IntakeSessionCreate,
    IntakeSessionResponse
)


router = APIRouter(
    prefix="/api/sessions",
    tags=["Intake Sessions"]
)


@router.post(
    "/",
    response_model=IntakeSessionResponse,
    status_code=201
)
def create_session(
    session_data: IntakeSessionCreate,
    db: Session = Depends(get_db)
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == session_data.patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    session = IntakeSession(
        patient_id=session_data.patient_id
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session


@router.get(
    "/{session_id}",
    response_model=IntakeSessionResponse
)
def get_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    session = (
        db.query(IntakeSession)
        .filter(IntakeSession.id == session_id)
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Intake session not found"
        )

    return session

@router.post(
    "/{session_id}/complete",
    response_model=IntakeSessionResponse
)
def complete_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    session = (
        db.query(IntakeSession)
        .filter(IntakeSession.id == session_id)
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Intake session not found"
        )

    if session.status != "IN_PROGRESS":
        raise HTTPException(
            status_code=400,
            detail="Session is not in progress"
        )

    session.status = "COMPLETED"
    session.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(session)

    return session