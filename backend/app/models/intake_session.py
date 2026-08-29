from sqlalchemy import Column, BigInteger, String, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base


class IntakeSession(Base):
    __tablename__ = "intake_sessions"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    patient_id = Column(
        BigInteger,
        nullable=False
    )

    status = Column(
        String(30),
        nullable=False,
        default="IN_PROGRESS"
    )

    started_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    completed_at = Column(
        DateTime,
        nullable=True
    )