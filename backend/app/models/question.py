from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Text,
    Boolean,
    Integer,
    DateTime
)
from sqlalchemy.sql import func

from app.database.connection import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    question_text = Column(
        Text,
        nullable=False
    )

    question_key = Column(
        String(100),
        nullable=False,
        unique=True
    )

    question_type = Column(
        String(30),
        nullable=False
    )

    is_required = Column(
        Boolean,
        nullable=False,
        default=False
    )

    display_order = Column(
        Integer,
        nullable=False,
        default=0
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )