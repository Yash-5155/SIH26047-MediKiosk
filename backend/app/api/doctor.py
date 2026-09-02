from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.core.config import AI_MODEL
from app.models.document_extraction import DocumentExtraction
from app.models.medical_document import MedicalDocument
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
from app.models.medical_document import MedicalDocument
from app.models.document_extraction import DocumentExtraction
from app.models.ai_extraction import AIExtraction

from app.schemas.doctor_case import (
    DoctorCaseResponse,
    CaseQuestionnaireItem,
    CaseDocumentItem,
)
from app.schemas.doctor_session import (
    DoctorSessionListItem,
    DoctorPatientSummary,
    ClinicalSummaryPreview,
)
from app.models.ai_extraction import AIExtraction
from app.schemas.ai_extraction import (
    AIExtractionResponse,
    AIExtractionUpdate,
    AIExtractionApproval,
)
from app.services.ai_extraction_service import (
    extract_clinical_information
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

@router.post(
    "/sessions/{session_id}/ai-extract",
    response_model=AIExtractionResponse
)
def create_ai_extraction(
    session_id: int,
    db: Session = Depends(get_db)
):
    # --------------------------------
    # 1. Verify session
    # --------------------------------

    session = (
        db.query(IntakeSession)
        .filter(
            IntakeSession.id == session_id
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Intake session not found"
        )

    # --------------------------------
    # 2. Get questionnaire responses
    # --------------------------------

    questionnaire_rows = (
        db.query(IntakeResponse, Question)
        .join(
            Question,
            Question.id == IntakeResponse.question_id
        )
        .filter(
            IntakeResponse.session_id == session_id
        )
        .order_by(
            Question.display_order
        )
        .all()
    )

    # --------------------------------
    # 3. Build questionnaire source
    # --------------------------------

    source_parts = []

    for response, question in questionnaire_rows:

        answer = response.answer_text or ""

        source_parts.append(
            f"[QUESTIONNAIRE] "
            f"{question.question_text}: "
            f"{answer}"
        )

    # --------------------------------
    # 4. Get verified OCR
    # --------------------------------

    verified_extractions = (
        db.query(
            DocumentExtraction,
            MedicalDocument
        )
        .join(
            MedicalDocument,
            MedicalDocument.id
            == DocumentExtraction.document_id
        )
        .filter(
            MedicalDocument.patient_id
            == session.patient_id,
            DocumentExtraction.extraction_status
            == "VERIFIED"
        )
        .order_by(
            MedicalDocument.uploaded_at
        )
        .all()
    )

    # --------------------------------
    # 5. Add verified OCR to source
    # --------------------------------

    for extraction, document in verified_extractions:

        if extraction.extracted_text:
            source_parts.append(
                f"[MEDICAL DOCUMENT - "
                f"{document.document_type}]"
            )

            source_parts.append(
                extraction.extracted_text
            )

    # --------------------------------
    # 6. Make combined source
    # --------------------------------

    source_text = "\n\n".join(
        source_parts
    ).strip()

    if not source_text:
        raise HTTPException(
            status_code=400,
            detail="No verified patient information found"
        )

    # --------------------------------
    # 7. Run extraction
    # --------------------------------

    extracted = extract_clinical_information(
        source_text
    )

    # --------------------------------
    # 8. Save result
    # --------------------------------

    ai_extraction = AIExtraction(
        session_id=session_id,
        source_text=source_text,
        extracted_data=extracted.model_dump(),
        extraction_status="COMPLETED",
        model_name=AI_MODEL
    )

    db.add(ai_extraction)
    db.commit()
    db.refresh(ai_extraction)

    return ai_extraction

@router.get(
    "/sessions/{session_id}/case",
    response_model=DoctorCaseResponse
)
def get_doctor_case(
    session_id: int,
    db: Session = Depends(get_db)
):
    # -----------------------------
    # 1. Get session
    # -----------------------------

    session = (
        db.query(IntakeSession)
        .filter(
            IntakeSession.id == session_id
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Intake session not found"
        )

    # -----------------------------
    # 2. Questionnaire
    # -----------------------------

    questionnaire_rows = (
        db.query(IntakeResponse, Question)
        .join(
            Question,
            Question.id == IntakeResponse.question_id
        )
        .filter(
            IntakeResponse.session_id == session_id
        )
        .order_by(
            Question.display_order
        )
        .all()
    )

    questionnaire = []

    for response, question in questionnaire_rows:
        questionnaire.append(
            CaseQuestionnaireItem(
                question_id=question.id,
                question_text=question.question_text,
                answer_text=response.answer_text
            )
        )

    # -----------------------------
    # 3. Documents
    # -----------------------------

    documents = (
        db.query(MedicalDocument)
        .filter(
            MedicalDocument.patient_id
            == session.patient_id
        )
        .order_by(
            MedicalDocument.uploaded_at.desc()
        )
        .all()
    )

    case_documents = []

    for document in documents:

        extraction = (
            db.query(DocumentExtraction)
            .filter(
                DocumentExtraction.document_id
                == document.id
            )
            .first()
        )

        extraction_status = None
        extracted_text = None

        if extraction:
            extraction_status = (
                extraction.extraction_status
            )

            # Only expose verified OCR
            if extraction_status == "VERIFIED":
                extracted_text = (
                    extraction.extracted_text
                )

        case_documents.append(
            CaseDocumentItem(
                id=document.id,
                document_type=document.document_type,
                file_name=document.file_name,
                uploaded_at=document.uploaded_at,
                extraction_status=extraction_status,
                extracted_text=extracted_text
            )
        )

    # -----------------------------
    # 4. Latest AI extraction
    # -----------------------------

    ai_extraction = (
        db.query(AIExtraction)
        .filter(
            AIExtraction.session_id
            == session_id
        )
        .order_by(
            AIExtraction.created_at.desc()
        )
        .first()
    )

    ai_data = None

    if ai_extraction:
        ai_data = {
            "id": ai_extraction.id,
            "extracted_data":
                ai_extraction.extracted_data,
            "extraction_status":
                ai_extraction.extraction_status,
            "model_name":
                ai_extraction.model_name,
            "created_at":
                ai_extraction.created_at,
            "updated_at":
                ai_extraction.updated_at,
        }

    # -----------------------------
    # 5. Return complete case
    # -----------------------------

    return DoctorCaseResponse(
        session_id=session.id,
        patient_id=session.patient_id,
        session_status=session.status,
        started_at=session.started_at,
        completed_at=session.completed_at,
        questionnaire=questionnaire,
        documents=case_documents,
        ai_extraction=ai_data
    )

@router.get(
    "/sessions",
    response_model=list[DoctorSessionListItem]
)
def get_doctor_sessions(
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(IntakeSession)
        .join(
            Patient,
            Patient.id == IntakeSession.patient_id
        )
        .order_by(
            IntakeSession.started_at.desc()
        )
        .all()
    )

    result = []

    for session in sessions:

        patient = session.patient

        # Basic preview from questionnaire
        chief_complaint = None
        symptom_duration = None

        responses = (
            db.query(IntakeResponse, Question)
            .join(
                Question,
                Question.id == IntakeResponse.question_id
            )
            .filter(
                IntakeResponse.session_id == session.id
            )
            .all()
        )

        for response, question in responses:

            if question.question_key == "chief_complaint":
                chief_complaint = response.answer_text

            elif question.question_key == "symptom_duration":
                symptom_duration = response.answer_text

        result.append(
            DoctorSessionListItem(
                session_id=session.id,

                patient=DoctorPatientSummary(
                    id=patient.id,
                    name=patient.name,
                    age=getattr(patient, "age", None),
                    gender=patient.gender
                ),

                status=session.status,

                # Temporary until backend triage is connected
                priority="ROUTINE",

                token=None,

                clinical_summary=ClinicalSummaryPreview(
                    chief_complaint=chief_complaint,
                    symptom_duration=symptom_duration
                ),

                started_at=session.started_at,
                completed_at=session.completed_at
            )
        )

    return result

@router.put(
    "/sessions/{session_id}/ai-extract",
    response_model=AIExtractionResponse
)
def update_ai_extraction(
    session_id: int,
    payload: AIExtractionUpdate,
    db: Session = Depends(get_db)
):
    extraction = (
        db.query(AIExtraction)
        .filter(
            AIExtraction.session_id == session_id
        )
        .order_by(
            AIExtraction.created_at.desc()
        )
        .first()
    )

    if extraction is None:
        raise HTTPException(
            status_code=404,
            detail="AI extraction not found"
        )

    extraction.extracted_data = (
        payload.extracted_data.model_dump()
    )

    extraction.extraction_status = "DOCTOR_REVIEWED"
    extraction.reviewed_at = func.now()

    db.commit()
    db.refresh(extraction)

    return extraction

@router.post(
    "/sessions/{session_id}/ai-extract/approve",
    response_model=AIExtractionResponse
)
def approve_ai_extraction(
    session_id: int,
    payload: AIExtractionApproval,
    db: Session = Depends(get_db)
):
    extraction = (
        db.query(AIExtraction)
        .filter(
            AIExtraction.session_id == session_id
        )
        .order_by(
            AIExtraction.created_at.desc()
        )
        .first()
    )

    if extraction is None:
        raise HTTPException(
            status_code=404,
            detail="AI extraction not found"
        )

    if payload.status != "VERIFIED_BY_DOCTOR":
        raise HTTPException(
            status_code=400,
            detail="Invalid approval status"
        )

    extraction.extraction_status = "VERIFIED_BY_DOCTOR"
    extraction.verified_at = func.now()

    db.commit()
    db.refresh(extraction)

    return extraction