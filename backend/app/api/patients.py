from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientResponse


router = APIRouter(
    prefix="/api/patients",
    tags=["Patients"]
)


@router.post(
    "/",
    response_model=PatientResponse,
    status_code=201
)
def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db)
):
    patient = Patient(
        name=patient_data.name,
        date_of_birth=patient_data.date_of_birth,
        gender=patient_data.gender,
        phone=patient_data.phone,
        preferred_language=patient_data.preferred_language
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return patient


@router.get(
    "/{patient_id}",
    response_model=PatientResponse
)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
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

    return patient