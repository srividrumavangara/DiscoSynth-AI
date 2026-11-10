"""Supabase JWT verification and user authentication dependencies."""

from __future__ import annotations

import logging
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Query, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import Profile

logger = logging.getLogger(__name__)

# HTTPBearer security scheme (auto_error=False allows query parameter fallback)
security = HTTPBearer(auto_error=False)


class AuthenticatedUser(BaseModel):
    """Verified identity derived from Supabase JWT."""

    id: str
    email: str
    role: str = "authenticated"


def verify_supabase_jwt(token: str) -> AuthenticatedUser:
    """Verify Supabase JWT signature, expiry, and audience.

    - Verifies HS256 signature against SUPABASE_JWT_SECRET when configured.
    - Validates token expiration (exp) and audience (aud="authenticated").
    - Extracts subject claim (sub) as user ID.
    - Never trusts unverified client claims.
    """
    settings = get_settings()

    if not token or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Production verification with Supabase JWT Secret
    if settings.SUPABASE_JWT_SECRET:
        try:
            # Decode and verify signature, audience, and expiry
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
                options={"verify_signature": True, "verify_aud": True, "verify_exp": True},
            )
            user_id = payload.get("sub")
            email = payload.get("email") or f"{user_id}@supabase.user"
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: missing subject (sub) claim",
                )
            return AuthenticatedUser(id=user_id, email=email, role=payload.get("role", "authenticated"))
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired",
                headers={"WWW-Authenticate": "Bearer error=\"invalid_token\", error_description=\"Token expired\""},
            )
        except jwt.InvalidTokenError as exc:
            logger.warning("JWT verification failed: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or forged authentication token",
                headers={"WWW-Authenticate": "Bearer error=\"invalid_token\""},
            )

    # Local development / automated testing fallback (when SUPABASE_JWT_SECRET is empty)
    if settings.ALLOW_MOCK_AUTH:
        # Support mock test tokens (e.g. "mock-user-alice", "mock-user-bob", or test payloads)
        token_clean = token.strip()
        if token_clean.startswith("mock-user-"):
            user_id = token_clean
            return AuthenticatedUser(id=user_id, email=f"{user_id}@test.local")

        # Also support dev tokens formatted as base64/jwt-like strings
        try:
            unverified = jwt.decode(token_clean, options={"verify_signature": False})
            user_id = unverified.get("sub") or "mock-user-001"
            email = unverified.get("email") or f"{user_id}@test.local"
            return AuthenticatedUser(id=user_id, email=email)
        except Exception:
            # If plain string token in dev mode
            return AuthenticatedUser(id=token_clean, email=f"{token_clean}@test.local")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Server authentication configuration missing (SUPABASE_JWT_SECRET unset)",
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Security(security),
    token_query: str | None = Query(None, alias="token", description="Bearer token fallback for direct file downloads"),
    db: Session = Depends(get_db),
) -> AuthenticatedUser:
    """FastAPI dependency to extract and verify the current authenticated user.

    Supports Authorization header (`Bearer <token>`) and query parameter (`?token=<token>`).
    Ensures a corresponding Profile row exists in the database.
    """
    token: str | None = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    elif token_query:
        token = token_query

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: please provide a valid Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = verify_supabase_jwt(token)

    # Ensure profile row exists to maintain relational FK integrity
    try:
        profile = db.query(Profile).filter(Profile.id == user.id).first()
        if not profile:
            profile = Profile(
                id=user.id,
                email=user.email,
                display_name=user.email.split("@")[0],
            )
            db.add(profile)
            db.commit()
    except Exception as exc:
        db.rollback()
        logger.debug("Profile auto-sync notice: %s", exc)

    return user
