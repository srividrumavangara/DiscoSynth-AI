"""Pytest fixtures shared across test modules."""

from __future__ import annotations

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure test configuration
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["LLM_PROVIDER"] = "mock"
os.environ["CORS_ORIGINS"] = "*"
os.environ["ALLOW_MOCK_AUTH"] = "true"

from app.database import Base, get_db
from app.main import app


@pytest.fixture(scope="session")
def engine():
    """Create a single shared in-memory SQLite engine with StaticPool."""
    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=test_engine)
    yield test_engine
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


@pytest.fixture
def db_session(engine):
    """Provide a database session for a test."""
    Session = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def client(engine):
    """Create a FastAPI test client authenticated as a default test user."""
    TestSession = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    def override_get_db():
        session = TestSession()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, headers={"Authorization": "Bearer mock-user-primary"}) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def unauth_client(engine):
    """Create an unauthenticated FastAPI test client."""
    TestSession = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    def override_get_db():
        session = TestSession()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def client_user_a(engine):
    """Client authenticated as User A (Alice)."""
    TestSession = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    def override_get_db():
        session = TestSession()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, headers={"Authorization": "Bearer mock-user-alice"}) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def client_user_b(engine):
    """Client authenticated as User B (Bob)."""
    TestSession = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    def override_get_db():
        session = TestSession()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, headers={"Authorization": "Bearer mock-user-bob"}) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def sample_generation_request():
    """Return a minimal valid generation request payload."""
    return {
        "name": "Test Dataset",
        "scenario": "corporate_fraud",
        "num_records": 100,
        "complexity": "basic",
        "document_types": ["email", "pdf", "docx"],
        "classification_distribution": "balanced",
        "seed": 42,
        "generation_method": "rule-based",
    }
