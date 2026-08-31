from sqlalchemy import (
    Column,
    BigInteger,
    String,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func

from app.database.connection import Base


class MedicalDocument(Base):
    __tablename__ = "medical_documents"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    patient_id = Column(
        BigInteger,
        ForeignKey(
            "patients.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    session_id = Column(
        BigInteger,
        ForeignKey(
            "intake_sessions.id",
            ondelete="SET NULL"
        ),
        nullable=True
    )

    document_type = Column(
        String(50),
        nullable=False,
        default="OTHER"
    )

    file_name = Column(
        String(255),
        nullable=False
    )

    file_path = Column(
        String(500),
        nullable=False
    )

    uploaded_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )