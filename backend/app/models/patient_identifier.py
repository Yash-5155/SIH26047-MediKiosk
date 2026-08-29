from sqlalchemy import Column, BigInteger, String, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base


class PatientIdentifier(Base):
    __tablename__ = "patient_identifiers"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    patient_id = Column(
        BigInteger,
        nullable=False
    )

    identifier_type = Column(
        String(20),
        nullable=False
    )

    identifier_hash = Column(
        String(255),
        nullable=False,
        unique=True
    )

    verification_status = Column(
        String(30),
        nullable=False,
        default="UNVERIFIED"
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    verified_at = Column(
        DateTime,
        nullable=True
    )