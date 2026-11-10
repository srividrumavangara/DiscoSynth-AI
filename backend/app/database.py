"""SQLAlchemy database engine and session management."""

from __future__ import annotations

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.config import get_settings

Base = declarative_base()

_engine = None
_SessionLocal: sessionmaker[Session] | None = None


def _get_engine():
    """Create or return the singleton SQLAlchemy engine."""
    global _engine
    if _engine is None:
        settings = get_settings()
        url = settings.DATABASE_URL

        connect_args: dict = {}
        if url.startswith("sqlite"):
            connect_args["check_same_thread"] = False

        _engine = create_engine(
            url,
            connect_args=connect_args,
            pool_pre_ping=True,
            echo=False,
        )

        # Enable WAL mode for SQLite for better concurrent access.
        if url.startswith("sqlite"):
            @event.listens_for(_engine, "connect")
            def _set_sqlite_pragma(dbapi_conn, _connection_record):
                cursor = dbapi_conn.cursor()
                cursor.execute("PRAGMA journal_mode=WAL;")
                cursor.execute("PRAGMA foreign_keys=ON;")
                cursor.close()

    return _engine


def get_session_factory() -> sessionmaker[Session]:
    """Return the singleton session factory, creating the engine if needed."""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(bind=_get_engine(), autocommit=False, autoflush=False)
    return _SessionLocal


def get_db():
    """FastAPI dependency that yields a database session and ensures cleanup."""
    factory = get_session_factory()
    db = factory()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    """Create all tables defined via ``Base.metadata``."""
    engine = _get_engine()
    Base.metadata.create_all(bind=engine)


def reset_engine() -> None:
    """Dispose of the current engine — used by tests to swap DBs."""
    global _engine, _SessionLocal
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _SessionLocal = None
