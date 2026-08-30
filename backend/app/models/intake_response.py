from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Text,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func

from app.database.connection import Base


class IntakeResponse(Base):
    __tablename__ = "intake_responses"

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

    question_id = Column(
        BigInteger,
        ForeignKey(
            "questions.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    answer_text = Column(
        Text,
        nullable=True
    )

    input_mode = Column(
        String(30),
        nullable=False,
        default="TEXT"
    )

    answered_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )