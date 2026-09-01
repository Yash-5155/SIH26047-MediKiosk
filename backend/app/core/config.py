import os

from dotenv import load_dotenv


load_dotenv()


AI_PROVIDER = os.getenv(
    "AI_PROVIDER",
    "mock"
)

AI_MODEL = os.getenv(
    "AI_MODEL",
    "local-rule-based-v1"
)

OPENAI_API_KEY = os.getenv(
    "OPENAI_API_KEY"
)