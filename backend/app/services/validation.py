"""Dataset validation and quality scoring service.

Evaluates a list of generated document-metadata records and produces a
``QualityReport`` with a weighted composite score and human-readable issues.
"""

from __future__ import annotations

import logging
from collections import Counter
from typing import Any

from app.schemas import QualityBreakdown, QualityReport
from app.utils.enums import (
    ConfidentialityLevel,
    CustodianRole,
    DocumentType,
    PrivilegeStatus,
    ReviewStatus,
)

logger = logging.getLogger(__name__)

# Fields that must be non-null for a record to be considered complete.
_REQUIRED_FIELDS: list[str] = [
    "document_id", "case_id", "document_type", "custodian_id",
    "custodian_role", "fictional_custodian_name", "fictional_organization",
    "date_created", "date_modified", "file_type", "confidentiality_level",
    "privilege_status", "review_status", "jurisdiction",
]

# Allowed enum value sets for fast lookup
_VALID_DOC_TYPES = {e.value for e in DocumentType}
_VALID_CONF_LEVELS = {e.value for e in ConfidentialityLevel}
_VALID_PRIV_STATUSES = {e.value for e in PrivilegeStatus}
_VALID_REVIEW_STATUSES = {e.value for e in ReviewStatus}
_VALID_CUST_ROLES = {e.value for e in CustodianRole}


def validate_dataset(
    records: list[dict[str, Any]],
    dataset_id: str = "",
    target_responsive_rate: float | None = None,
) -> QualityReport:
    """Validate *records* and return a :class:`QualityReport`.

    Parameters
    ----------
    records:
        List of document-metadata dicts (as produced by ``SyntheticDataGenerator``).
    dataset_id:
        UUID of the dataset being validated.
    target_responsive_rate:
        Expected fraction of responsive documents (for distribution adherence).
    """
    total = len(records)
    if total == 0:
        return QualityReport(
            dataset_id=dataset_id,
            total_records=0,
            quality_score=0.0,
            breakdown=QualityBreakdown(
                schema_validity=0.0,
                completeness=0.0,
                uniqueness=0.0,
                logical_consistency=0.0,
                distribution_adherence=0.0,
            ),
            issues=["Dataset contains no records."],
        )

    issues: list[str] = []

    # ------------------------------------------------------------------
    # 1. Schema validity (25 %)
    # ------------------------------------------------------------------
    schema_valid_count = 0
    for rec in records:
        valid = True
        # Check document_type
        if rec.get("document_type") not in _VALID_DOC_TYPES:
            valid = False
        # Check confidentiality
        if rec.get("confidentiality_level") not in _VALID_CONF_LEVELS:
            valid = False
        # Check privilege_status
        if rec.get("privilege_status") not in _VALID_PRIV_STATUSES:
            valid = False
        # Check review_status
        if rec.get("review_status") not in _VALID_REVIEW_STATUSES:
            valid = False
        # Check custodian_role
        if rec.get("custodian_role") not in _VALID_CUST_ROLES:
            valid = False
        # Check responsive is bool
        if not isinstance(rec.get("responsive"), bool):
            valid = False
        # Check issue_tags is list
        if not isinstance(rec.get("issue_tags"), list):
            valid = False
        # Check date_created < date_modified (or equal)
        dc = rec.get("date_created")
        dm = rec.get("date_modified")
        if dc and dm and dc > dm:
            valid = False
        if valid:
            schema_valid_count += 1

    schema_validity = schema_valid_count / total
    if schema_validity < 1.0:
        issues.append(f"{total - schema_valid_count} record(s) failed schema validation.")

    # ------------------------------------------------------------------
    # 2. Completeness (25 %)
    # ------------------------------------------------------------------
    total_fields = total * len(_REQUIRED_FIELDS)
    filled_fields = 0
    for rec in records:
        for field in _REQUIRED_FIELDS:
            val = rec.get(field)
            if val is not None and val != "":
                filled_fields += 1

    completeness = filled_fields / total_fields if total_fields > 0 else 0.0
    if completeness < 1.0:
        missing_count = total_fields - filled_fields
        issues.append(f"{missing_count} required field(s) are missing or empty.")

    # ------------------------------------------------------------------
    # 3. Uniqueness (20 %)
    # ------------------------------------------------------------------
    doc_ids = [rec.get("document_id") for rec in records]
    unique_ids = set(doc_ids)
    duplicate_count = len(doc_ids) - len(unique_ids)
    uniqueness = 1.0 - (duplicate_count / total)
    if duplicate_count > 0:
        issues.append(f"{duplicate_count} duplicate document_id(s) found.")

    # ------------------------------------------------------------------
    # 4. Logical consistency (20 %)
    # ------------------------------------------------------------------
    consistent_count = 0
    for rec in records:
        consistent = True

        # date_created should not be after date_modified
        dc = rec.get("date_created")
        dm = rec.get("date_modified")
        if dc and dm and dc > dm:
            consistent = False

        # Privileged documents should generally require redaction
        # (but we don't enforce strictly — just check that redaction is True
        #  when privilege is "privileged" at a higher rate; this is a soft check)
        # For strict check: privileged → redaction should be True
        # We give partial credit.

        # File size should be positive
        fs = rec.get("file_size_kb")
        if fs is not None and fs <= 0:
            consistent = False

        # Attachment count should be non-negative
        ac = rec.get("attachment_count")
        if ac is not None and ac < 0:
            consistent = False

        # Communication channel should only be set for emails
        cc = rec.get("communication_channel")
        dt = rec.get("document_type")
        if cc is not None and dt != "email":
            consistent = False
        if cc is None and dt == "email":
            consistent = False

        if consistent:
            consistent_count += 1

    logical_consistency = consistent_count / total
    if logical_consistency < 1.0:
        issues.append(
            f"{total - consistent_count} record(s) have logical consistency issues."
        )

    # ------------------------------------------------------------------
    # 5. Distribution adherence (10 %)
    # ------------------------------------------------------------------
    if target_responsive_rate is not None and target_responsive_rate > 0:
        actual_responsive = sum(1 for r in records if r.get("responsive") is True)
        actual_rate = actual_responsive / total
        # Score = 1 - |actual - target| / target, clamped to [0, 1]
        deviation = abs(actual_rate - target_responsive_rate)
        distribution_adherence = max(0.0, 1.0 - (deviation / max(target_responsive_rate, 0.01)))
    else:
        # No target specified — assume perfect adherence.
        distribution_adherence = 1.0

    # ------------------------------------------------------------------
    # Composite score
    # ------------------------------------------------------------------
    quality_score = round(
        schema_validity * 0.25
        + completeness * 0.25
        + uniqueness * 0.20
        + logical_consistency * 0.20
        + distribution_adherence * 0.10,
        4,
    )

    breakdown = QualityBreakdown(
        schema_validity=round(schema_validity, 4),
        completeness=round(completeness, 4),
        uniqueness=round(uniqueness, 4),
        logical_consistency=round(logical_consistency, 4),
        distribution_adherence=round(distribution_adherence, 4),
    )

    if not issues:
        issues.append("No issues detected — dataset passes all quality checks.")

    return QualityReport(
        dataset_id=dataset_id,
        total_records=total,
        quality_score=quality_score,
        breakdown=breakdown,
        issues=issues,
    )
