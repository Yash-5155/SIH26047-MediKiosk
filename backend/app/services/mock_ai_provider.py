import re

from app.schemas.ai_extraction import (
    AIClinicalExtraction
)


def extract_clinical_information(
    text: str
) -> AIClinicalExtraction:

    text_lower = text.lower()

    symptoms = []

    possible_symptoms = [
        "fever",
        "headache",
        "cough",
        "cold",
        "vomiting",
        "nausea",
        "fatigue",
        "body pain",
        "chest pain",
        "abdominal pain",
        "dizziness",
        "breathing difficulty",
    ]

    for symptom in possible_symptoms:
        if symptom in text_lower:
            symptoms.append(symptom)

    duration = None

    duration_match = re.search(
        r"(\d+)\s*(day|days|week|weeks|month|months)",
        text_lower
    )

    if duration_match:
        duration = duration_match.group(0)

    severity = None

    if "severe" in text_lower:
        severity = "SEVERE"
    elif "moderate" in text_lower:
        severity = "MODERATE"
    elif "mild" in text_lower:
        severity = "MILD"

    fever = None

    if "no fever" in text_lower:
        fever = "NO"
    elif "fever" in text_lower:
        fever = "YES"

    return AIClinicalExtraction(
        symptoms=symptoms,
        duration=duration,
        severity=severity,
        fever=fever,
        additional_information=text
    )