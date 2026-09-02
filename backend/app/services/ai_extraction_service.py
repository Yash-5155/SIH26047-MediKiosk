from app.core.config import AI_PROVIDER

from app.services.mock_ai_provider import (
    extract_clinical_information as mock_extract
)


def extract_clinical_information(text: str):
    if AI_PROVIDER == "mock":
        return mock_extract(text)

    raise RuntimeError(
        f"Unsupported AI provider: {AI_PROVIDER}"
    )