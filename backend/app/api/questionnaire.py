from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.question import Question
from app.models.question_option import QuestionOption
from app.models.intake_response import IntakeResponse
from app.models.intake_session import IntakeSession
from app.schemas.questionnaire import (
    QuestionResponse,
    IntakeResponseCreate,
    IntakeResponseResponse,
)


router = APIRouter(
    prefix="/api",
    tags=["Questionnaire"]
)


@router.get(
    "/questions",
    response_model=list[QuestionResponse]
)
def get_questions(
    db: Session = Depends(get_db)
):
    questions = (
        db.query(Question)
        .filter(Question.is_active == True)
        .order_by(Question.display_order)
        .all()
    )

    result = []

    for question in questions:
        options = (
            db.query(QuestionOption)
            .filter(
                QuestionOption.question_id == question.id
            )
            .order_by(QuestionOption.display_order)
            .all()
        )

        result.append(
            QuestionResponse(
                id=question.id,
                question_text=question.question_text,
                question_key=question.question_key,
                question_type=question.question_type,
                is_required=question.is_required,
                display_order=question.display_order,
                options=options
            )
        )

    return result


@router.post(
    "/sessions/{session_id}/responses",
    response_model=IntakeResponseResponse,
    status_code=201
)
def create_response(
    session_id: int,
    response_data: IntakeResponseCreate,
    db: Session = Depends(get_db)
):
    session = (
        db.query(IntakeSession)
        .filter(IntakeSession.id == session_id)
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Intake session not found"
        )

    if session.status != "IN_PROGRESS":
        raise HTTPException(
            status_code=400,
            detail="Session is not in progress"
        )

    question = (
        db.query(Question)
        .filter(
            Question.id == response_data.question_id,
            Question.is_active == True
        )
        .first()
    )

    if question is None:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    existing_response = (
        db.query(IntakeResponse)
        .filter(
            IntakeResponse.session_id == session_id,
            IntakeResponse.question_id
            == response_data.question_id
        )
        .first()
    )

    if existing_response:
        existing_response.answer_text = (
            response_data.answer_text
        )
        existing_response.input_mode = (
            response_data.input_mode
        )

        db.commit()
        db.refresh(existing_response)

        return existing_response

    response = IntakeResponse(
        session_id=session_id,
        question_id=response_data.question_id,
        answer_text=response_data.answer_text,
        input_mode=response_data.input_mode
    )

    db.add(response)
    db.commit()
    db.refresh(response)

    return response