import hashlib


def normalize_identifier(identifier: str) -> str:
    return identifier.strip().upper()


def hash_identifier(identifier: str) -> str:
    normalized = normalize_identifier(identifier)

    return hashlib.sha256(
        normalized.encode("utf-8")
    ).hexdigest()


def mock_verify_identifier(
    identifier_type: str,
    identifier: str
) -> bool:
    """
    Development-only verification.

    This does NOT perform real Aadhaar or ABHA verification.
    """

    if not identifier.strip():
        return False

    if identifier_type not in {"AADHAAR", "ABHA"}:
        return False

    return True