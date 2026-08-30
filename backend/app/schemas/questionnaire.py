from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class QuestionOptionResponse(BaseModel):
    id: int
    option_value: str
    option_label: str
    display_order: int

    class Config:
        from_attributes = True


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    question_key: str
    question_type: str
    is_required: bool
    display_order: int
    options: list[QuestionOptionResponse] = Field(
    default_factory=list
    )

    class Config:
        from_attributes = True


class IntakeResponseCreate(BaseModel):
    question_id: int
    answer_text: str | None = None

    input_mode: Literal[
        "TEXT",
        "VOICE",
        "TOUCH"
    ] = "TEXT"


class IntakeResponseResponse(BaseModel):
    id: int
    session_id: int
    question_id: int
    answer_text: str | None
    input_mode: str
    answered_at: datetime

    class Config:
        from_attributes = True