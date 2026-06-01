import secrets


def make_ref_code() -> str:
    return secrets.token_urlsafe(8).replace("-", "_")[:12]
