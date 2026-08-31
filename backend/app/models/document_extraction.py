from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func
from app.database.connection import Base


class DocumentExtraction(Base):
    __tablename__ = "document_extractions"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    document_id = Column(
        BigInteger,
        ForeignKey(
            "medical_documents.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        unique=True
    )

    extracted_text = Column(
        Text,
        nullable=True
    )

    extraction_status = Column(
        String(30),
        nullable=False,
        default="PENDING"
    )

    extraction_engine = Column(
        String(50),
        nullable=True
    )

    extracted_at = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
    DateTime,
    nullable=False,
    server_default=func.current_timestamp()
)