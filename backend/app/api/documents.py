import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.document_extraction import DocumentExtraction
from app.schemas.document_extraction import (
    DocumentExtractionResponse,
    DocumentExtractionUpdate,
)
from app.schemas.document import (
    MedicalDocumentResponse,
    MedicalDocumentListItem,
)
from app.services.ocr_service import extract_text

from app.database.connection import get_db
from app.models.medical_document import MedicalDocument
from app.models.patient import Patient
from app.models.intake_session import IntakeSession
from app.schemas.document import MedicalDocumentResponse


router = APIRouter(
    prefix="/api/documents",
    tags=["Medical Documents"]
)


UPLOAD_DIR = os.path.join(
    "uploads",
    "documents"
)


ALLOWED_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
}


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


ALLOWED_DOCUMENT_TYPES = {
    "PRESCRIPTION",
    "LAB_REPORT",
    "DISCHARGE_SUMMARY",
    "MEDICAL_RECORD",
    "OTHER",
}


@router.post(
    "/upload",
    response_model=MedicalDocumentResponse,
    status_code=201
)
async def upload_document(
    patient_id: int = Form(...),
    session_id: int | None = Form(None),
    document_type: str = Form("OTHER"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # -----------------------------
    # 1. Validate patient
    # -----------------------------

    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # -----------------------------
    # 2. Validate session
    # -----------------------------

    if session_id is not None:

        session = (
            db.query(IntakeSession)
            .filter(
                IntakeSession.id == session_id,
                IntakeSession.patient_id == patient_id
            )
            .first()
        )

        if session is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Intake session not found "
                    "for this patient"
                )
            )

    # -----------------------------
    # 3. Validate document type
    # -----------------------------

    document_type = document_type.upper().strip()

    if document_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid document type. Allowed types: "
                "PRESCRIPTION, LAB_REPORT, "
                "DISCHARGE_SUMMARY, MEDICAL_RECORD, OTHER"
            )
        )

    # -----------------------------
    # 4. Validate file type
    # -----------------------------

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Allowed: PDF, JPEG, PNG, WEBP"
            )
        )

    # -----------------------------
    # 5. Read file
    # -----------------------------

    contents = await file.read()

    if len(contents) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size must not exceed 10 MB"
        )

    # -----------------------------
    # 6. Generate safe filename
    # -----------------------------

    extension = ""

    if file.filename and "." in file.filename:
        extension = os.path.splitext(
            file.filename
        )[1].lower()

    stored_filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    # -----------------------------
    # 7. Create upload directory
    # -----------------------------

    os.makedirs(
        UPLOAD_DIR,
        exist_ok=True
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        stored_filename
    )

    # -----------------------------
    # 8. Save file
    # -----------------------------

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(contents)

    except OSError:
        raise HTTPException(
            status_code=500,
            detail="Unable to save uploaded file"
        )

    # -----------------------------
    # 9. Save metadata
    # -----------------------------

    document = MedicalDocument(
        patient_id=patient_id,
        session_id=session_id,
        document_type=document_type,
        file_name=file.filename or "unknown",
        file_path=file_path
    )

    try:
        db.add(document)
        db.commit()
        db.refresh(document)

    except Exception:
        db.rollback()

        # Remove file if database insert fails
        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail="Unable to save document information"
        )

    return document

@router.post(
    "/{document_id}/extract",
    response_model=DocumentExtractionResponse
)
def extract_document_text(
    document_id: int,
    db: Session = Depends(get_db)
):
    # Find document
    document = (
        db.query(MedicalDocument)
        .filter(
            MedicalDocument.id == document_id
        )
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Medical document not found"
        )

    # Check whether extraction already exists
    extraction = (
        db.query(DocumentExtraction)
        .filter(
            DocumentExtraction.document_id
            == document_id
        )
        .first()
    )

    if extraction is None:
        extraction = DocumentExtraction(
            document_id=document_id,
            extraction_status="PROCESSING"
        )

        db.add(extraction)
        db.commit()
        db.refresh(extraction)

    else:
        extraction.extraction_status = "PROCESSING"
        db.commit()

    # Check physical file
    if not os.path.exists(document.file_path):
        extraction.extraction_status = "FAILED"
        db.commit()

        raise HTTPException(
            status_code=404,
            detail="Document file not found"
        )

    try:
        text = extract_text(
            document.file_path
        )

        extraction.extracted_text = text
        extraction.extraction_status = "COMPLETED"
        extraction.extraction_engine = "TESSERACT"
        extraction.extracted_at = datetime.utcnow()

        db.commit()
        db.refresh(extraction)

        return extraction

    except Exception as e:
        extraction.extraction_status = "FAILED"
        db.commit()

        print("OCR ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=f"Document text extraction failed: {str(e)}"
        )

@router.get(
    "/{document_id}/extraction",
    response_model=DocumentExtractionResponse
)
def get_document_extraction(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = (
        db.query(MedicalDocument)
        .filter(MedicalDocument.id == document_id)
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Medical document not found"
        )

    extraction = (
        db.query(DocumentExtraction)
        .filter(
            DocumentExtraction.document_id == document_id
        )
        .first()
    )

    if extraction is None:
        raise HTTPException(
            status_code=404,
            detail="Document extraction not found"
        )

    return extraction

@router.put(
    "/{document_id}/extraction",
    response_model=DocumentExtractionResponse
)
def update_document_extraction(
    document_id: int,
    update_data: DocumentExtractionUpdate,
    db: Session = Depends(get_db)
):
    document = (
        db.query(MedicalDocument)
        .filter(MedicalDocument.id == document_id)
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Medical document not found"
        )

    extraction = (
        db.query(DocumentExtraction)
        .filter(
            DocumentExtraction.document_id == document_id
        )
        .first()
    )

    if extraction is None:
        raise HTTPException(
            status_code=404,
            detail="Document extraction not found"
        )

    extraction.extracted_text = update_data.extracted_text

    # Mark it as manually verified
    extraction.extraction_status = "VERIFIED"
    extraction.extraction_engine = "TESSERACT+MANUAL"

    db.commit()
    db.refresh(extraction)

    return extraction

@router.get(
    "/patient/{patient_id}",
    response_model=list[MedicalDocumentListItem]
)
def get_patient_documents(
    patient_id: int,
    db: Session = Depends(get_db)
):
    # Check patient
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    documents = (
        db.query(MedicalDocument)
        .filter(
            MedicalDocument.patient_id == patient_id
        )
        .order_by(
            MedicalDocument.uploaded_at.desc()
        )
        .all()
    )

    result = []

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

        if extraction:
            extraction_status = (
                extraction.extraction_status
            )

        result.append(
            MedicalDocumentListItem(
                id=document.id,
                patient_id=document.patient_id,
                session_id=document.session_id,
                document_type=document.document_type,
                file_name=document.file_name,
                uploaded_at=document.uploaded_at,
                extraction_status=extraction_status
            )
        )

    return result