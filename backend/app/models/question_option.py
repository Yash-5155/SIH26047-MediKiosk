from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Integer,
    ForeignKey
)

from app.database.connection import Base


class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    question_id = Column(
        BigInteger,
        ForeignKey(
            "questions.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    option_value = Column(
        String(100),
        nullable=False
    )

    option_label = Column(
        String(255),
        nullable=False
    )

    display_order = Column(
        Integer,
        nullable=False,
        default=0
    )