"""Pydantic request / response schemas for the DiscoSynth AI API."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

from app.utils.enums import (
    ClassificationDistribution,
    Complexity,
    GenerationMethod,
    Scenario,
)

T = TypeVar("T")


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class GenerationRequest(BaseModel):
    """Payload for POST /api/generate."""

    name: str = Field(..., min_length=1, max_length=255, description="Human-readable dataset name.")
    scenario: Scenario = Field(..., description="Litigation scenario type.")
    num_records: int = Field(100, description="Number of records to generate.")
    complexity: Complexity = Field(Complexity.INTERMEDIATE, description="Data complexity level.")
    document_types: list[str] = Field(
        default_factory=lambda: ["email", "pdf", "docx"],
        description="Document types to include.",
    )
    classification_distribution: ClassificationDistribution = Field(
        ClassificationDistribution.REALISTIC,
        description="How responsive/non-responsive split is handled.",
    )
    custom_responsive_pct: float | None = Field(
        None,
        ge=0.0,
        le=1.0,
        description="Custom responsive percentage when distribution is 'custom'.",
    )
    seed: int | None = Field(None, description="Random seed for reproducibility.")
    generation_method: GenerationMethod = Field(
        GenerationMethod.RULE_BASED,
        description="Generation method: 'rule-based' or 'ai-assisted'.",
    )

    model_config = {"json_schema_extra": {
        "examples": [
            {
                "name": "Corporate Fraud Test Set",
                "scenario": "corporate_fraud",
                "num_records": 500,
                "complexity": "intermediate",
                "document_types": ["email", "pdf", "financial_report"],
                "classification_distribution": "realistic",
                "seed": 42,
                "generation_method": "rule-based",
            }
        ]
    }}


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class ProfileResponse(BaseModel):
    """User profile response."""

    id: str
    email: str
    display_name: str | None = None
    avatar_url: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DocumentMetadataResponse(BaseModel):
    """Single document metadata record returned by the API."""

    id: int
    dataset_id: str
    document_id: str
    case_id: str
    document_type: str
    custodian_id: str
    custodian_role: str
    fictional_custodian_name: str
    fictional_organization: str
    date_created: datetime
    date_modified: datetime
    file_type: str
    communication_channel: str | None = None
    confidentiality_level: str
    privilege_status: str
    responsive: bool
    issue_tags: list[str]
    legal_hold: bool
    review_status: str
    redaction_required: bool
    document_family_id: str | None = None
    attachment_count: int
    file_size_kb: float
    language: str
    jurisdiction: str

    model_config = {"from_attributes": True}


class DatasetResponse(BaseModel):
    """Detailed view of a dataset."""

    id: str
    user_id: str | None = None
    name: str
    scenario: str
    num_records: int
    complexity: str
    generation_method: str
    status: str
    quality_score: float | None = None
    seed: int | None = None
    config_json: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DatasetListResponse(BaseModel):
    """Lightweight dataset listing."""

    id: str
    user_id: str | None = None
    name: str
    scenario: str
    num_records: int
    complexity: str
    generation_method: str
    status: str
    quality_score: float | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class GenerationHistoryResponse(BaseModel):
    """Log of a generation run."""

    id: str
    user_id: str | None = None
    dataset_id: str | None = None
    generation_status: str
    generation_config: dict[str, Any] | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper."""

    page: int
    page_size: int
    total: int
    items: list[T]


class QualityBreakdown(BaseModel):
    """Breakdown of quality score components."""

    schema_validity: float = Field(..., description="Fraction of records with valid schema (weight 25%).")
    completeness: float = Field(..., description="Fraction of non-null required fields (weight 25%).")
    uniqueness: float = Field(..., description="1 - duplicate_rate (weight 20%).")
    logical_consistency: float = Field(..., description="Fraction of logically consistent records (weight 20%).")
    distribution_adherence: float = Field(..., description="Closeness to target distribution (weight 10%).")


class QualityReport(BaseModel):
    """Full quality assessment of a dataset."""

    dataset_id: str
    total_records: int
    quality_score: float
    breakdown: QualityBreakdown
    issues: list[str]


class TimelinePoint(BaseModel):
    """Single point on a timeline chart."""

    date: str
    count: int


class AnalyticsResponse(BaseModel):
    """Aggregated analytics for a dataset."""

    dataset_id: str
    total_records: int
    document_type_distribution: dict[str, int]
    responsive_distribution: dict[str, int]
    privilege_distribution: dict[str, int]
    confidentiality_distribution: dict[str, int]
    timeline: list[TimelinePoint]
    issue_tag_frequency: dict[str, int]
    review_status_distribution: dict[str, int]
    metadata_completeness: float


class HealthResponse(BaseModel):
    """Health-check response."""

    status: str
    database: str
    llm_provider: str
    app_name: str
