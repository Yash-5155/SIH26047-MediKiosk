from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.intake_response import IntakeResponse
from app.models.intake_session import IntakeSession
from app.models.patient import Patient
from app.models.question import Question
from app.schemas.doctor import (
    DoctorCaseResponse,
    DoctorPatientResponse,
    DoctorSessionResponse,
)
from app.schemas.doctor import (
    DoctorCaseResponse,
    DoctorPatientResponse,
    DoctorSessionResponse,
    DoctorSessionListItem,
)
from app.schemas.case_summary import (
    CaseSummaryResponse,
    CasePatient,
)
from app.services.case_summary_service import (
    build_clinical_summary
)


router = APIRouter(
    prefix="/api/doctor",
    tags=["Doctor"]
)


@router.get(
    "/sessions/{session_id}",
    response_model=DoctorSessionResponse
)
def get_doctor_case(
    session_id: int,
    db: Session = Depends(get_db)
):
    # Find session
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

    # Find patient
    patient = (
        db.query(Patient)
        .filter(Patient.id == session.patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # Get responses with their questions
    rows = (
        db.query(IntakeResponse, Question)
        .join(
            Question,
            Question.id == IntakeResponse.question_id
        )
        .filter(
            IntakeResponse.session_id == session_id
        )
        .order_by(Question.display_order)
        .all()
    )

    responses = []

    for response, question in rows:
        responses.append(
            DoctorCaseResponse(
                question_key=question.question_key,
                question=question.question_text,
                answer=response.answer_text,
                input_mode=response.input_mode
            )
        )

    return DoctorSessionResponse(
        session_id=session.id,
        status=session.status,
        started_at=session.started_at,
        completed_at=session.completed_at,
        patient=DoctorPatientResponse(
            id=patient.id,
            name=patient.name,
            date_of_birth=patient.date_of_birth,
            gender=patient.gender,
            phone=patient.phone,
            preferred_language=patient.preferred_language
        ),
        responses=responses
    )

@router.get(
    "/sessions",
    response_model=list[DoctorSessionListItem]
)
def get_doctor_sessions(
    db: Session = Depends(get_db)
):
    rows = (
        db.query(IntakeSession, Patient)
        .join(
            Patient,
            Patient.id == IntakeSession.patient_id
        )
        .order_by(
            IntakeSession.started_at.desc()
        )
        .all()
    )

    return [
        DoctorSessionListItem(
            session_id=session.id,
            patient_name=patient.name,
            status=session.status,
            started_at=session.started_at,
            completed_at=session.completed_at
        )
        for session, patient in rows
    ]

@router.get(
    "/sessions/{session_id}/summary",
    response_model=CaseSummaryResponse
)
def get_case_summary(
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

    patient = (
        db.query(Patient)
        .filter(Patient.id == session.patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    rows = (
        db.query(IntakeResponse, Question)
        .join(
            Question,
            Question.id == IntakeResponse.question_id
        )
        .filter(
            IntakeResponse.session_id == session_id
        )
        .order_by(Question.display_order)
        .all()
    )

    clinical_summary = build_clinical_summary(rows)

    return CaseSummaryResponse(
        session_id=session.id,
        status=session.status,
        started_at=session.started_at,
        completed_at=session.completed_at,
        patient=CasePatient(
            id=patient.id,
            name=patient.name,
            date_of_birth=patient.date_of_birth,
            gender=patient.gender,
            preferred_language=patient.preferred_language
        ),
        clinical_summary=clinical_summary
    )