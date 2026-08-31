from app.models.intake_response import IntakeResponse
from app.models.question import Question
from app.schemas.case_summary import ClinicalSummary


def build_clinical_summary(
    responses: list[tuple[IntakeResponse, Question]]
) -> ClinicalSummary:

    data = {}

    for response, question in responses:
        data[question.question_key] = response.answer_text

    return ClinicalSummary(
        chief_complaint=data.get("chief_complaint"),
        symptom_duration=data.get("symptom_duration"),
        severity=data.get("severity"),
        has_fever=data.get("has_fever"),
        existing_conditions=data.get("existing_conditions"),
        current_medications=data.get("current_medications"),
        allergies=data.get("allergies"),
        past_medical_history=data.get("past_medical_history"),
        pain_level=data.get("pain_level"),
        additional_information=data.get(
            "additional_information"
        )
    )