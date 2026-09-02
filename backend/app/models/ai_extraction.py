from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Text,
    DateTime,
    ForeignKey,
    JSON
)
from sqlalchemy.sql import func

from app.database.connection import Base


class AIExtraction(Base):
    __tablename__ = "ai_extractions"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    session_id = Column(
        BigInteger,
        ForeignKey(
            "intake_sessions.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    source_text = Column(
        Text,
        nullable=True
    )

    extracted_data = Column(
        JSON,
        nullable=True
    )

    extraction_status = Column(
        String(30),
        nullable=False,
        default="PENDING"
    )

    model_name = Column(
        String(100),
        nullable=True
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )
    reviewed_at = Column(
    DateTime,
    nullable=True
    )

    verified_at = Column(
    DateTime,
    nullable=True
    )