"""SQLAlchemy ORM models for DiscoSynth AI."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _uuid() -> str:
    """Generate a new UUID4 string."""
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    """Return the current UTC timestamp."""
    return datetime.now(timezone.utc)


class Profile(Base):
    """User profile referencing Supabase auth.users."""

    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

    datasets: Mapped[list["Dataset"]] = relationship(
        "Dataset",
        back_populates="owner",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )
    generation_history: Mapped[list["GenerationHistory"]] = relationship(
        "GenerationHistory",
        back_populates="owner",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    def __repr__(self) -> str:
        return f"<Profile id={self.id!r} email={self.email!r}>"


class Dataset(Base):
    """Represents a generated synthetic litigation dataset."""

    __tablename__ = "datasets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    scenario: Mapped[str] = mapped_column(String(64), nullable=False)
    num_records: Mapped[int] = mapped_column(Integer, nullable=False)
    complexity: Mapped[str] = mapped_column(String(32), nullable=False, default="intermediate")
    generation_method: Mapped[str] = mapped_column(String(32), nullable=False, default="rule-based")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="pending")
    quality_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    seed: Mapped[int | None] = mapped_column(Integer, nullable=True)
    config_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

    owner: Mapped["Profile | None"] = relationship("Profile", back_populates="datasets")
    records: Mapped[list["DocumentMetadata"]] = relationship(
        "DocumentMetadata",
        back_populates="dataset",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )
    history: Mapped[list["GenerationHistory"]] = relationship(
        "GenerationHistory",
        back_populates="dataset",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    @property
    def record_count(self) -> int:
        """Alias for num_records for schema consistency."""
        return self.num_records

    def __repr__(self) -> str:
        return f"<Dataset id={self.id!r} name={self.name!r} user_id={self.user_id!r}>"


class DocumentMetadata(Base):
    """A single synthetic litigation document metadata record."""

    __tablename__ = "document_metadata"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dataset_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False
    )
    document_id: Mapped[str] = mapped_column(String(64), nullable=False)
    case_id: Mapped[str] = mapped_column(String(64), nullable=False)
    document_type: Mapped[str] = mapped_column(String(32), nullable=False)
    custodian_id: Mapped[str] = mapped_column(String(64), nullable=False)
    custodian_role: Mapped[str] = mapped_column(String(32), nullable=False)
    fictional_custodian_name: Mapped[str] = mapped_column(String(128), nullable=False)
    fictional_organization: Mapped[str] = mapped_column(String(128), nullable=False)
    date_created: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    date_modified: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    file_type: Mapped[str] = mapped_column(String(16), nullable=False)
    communication_channel: Mapped[str | None] = mapped_column(String(32), nullable=True)
    confidentiality_level: Mapped[str] = mapped_column(String(32), nullable=False)
    privilege_status: Mapped[str] = mapped_column(String(32), nullable=False)
    responsive: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    issue_tags: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    legal_hold: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    review_status: Mapped[str] = mapped_column(String(32), nullable=False, default="pending")
    redaction_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    document_family_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    attachment_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    file_size_kb: Mapped[float] = mapped_column(Float, nullable=False)
    language: Mapped[str] = mapped_column(String(8), nullable=False, default="en")
    jurisdiction: Mapped[str] = mapped_column(String(64), nullable=False)

    dataset: Mapped["Dataset"] = relationship("Dataset", back_populates="records")

    __table_args__ = (
        Index("ix_docmeta_dataset_id", "dataset_id"),
        Index("ix_docmeta_document_type", "document_type"),
        Index("ix_docmeta_responsive", "responsive"),
        Index("ix_docmeta_privilege_status", "privilege_status"),
    )

    def __repr__(self) -> str:
        return f"<DocumentMetadata id={self.id} document_id={self.document_id!r}>"


class GenerationHistory(Base):
    """Audit log of synthetic scenario generation runs."""

    __tablename__ = "generation_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=True, index=True
    )
    dataset_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=True, index=True
    )
    generation_status: Mapped[str] = mapped_column(String(32), nullable=False, default="completed")
    generation_config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    owner: Mapped["Profile | None"] = relationship("Profile", back_populates="generation_history")
    dataset: Mapped["Dataset | None"] = relationship("Dataset", back_populates="history")

    def __repr__(self) -> str:
        return f"<GenerationHistory id={self.id!r} status={self.generation_status!r}>"
