import hashlib


def hash_identifier(identifier: str) -> str:
    normalized = identifier.strip()

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
    Replace with an authorized verification integration later.
    """

    if not identifier.strip():
        return False

    return True