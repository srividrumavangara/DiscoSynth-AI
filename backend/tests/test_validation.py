"""Tests for the validation and quality scoring service."""

from __future__ import annotations

import pytest
from datetime import datetime, timezone

from app.services.validation import validate_dataset


def _make_valid_record(seq: int = 0, **overrides) -> dict:
    """Create a single valid record dict."""
    rec = {
        "document_id": f"DOC-TEST-{seq:06d}",
        "case_id": "CASE-TEST",
        "document_type": "email",
        "custodian_id": "CUST-001",
        "custodian_role": "executive",
        "fictional_custodian_name": "John Doe",
        "fictional_organization": "Test Corp",
        "date_created": datetime(2023, 1, 1, tzinfo=timezone.utc),
        "date_modified": datetime(2023, 6, 1, tzinfo=timezone.utc),
        "file_type": ".eml",
        "communication_channel": "outlook",
        "confidentiality_level": "confidential",
        "privilege_status": "not_privileged",
        "responsive": True,
        "issue_tags": ["fraud", "investigation"],
        "legal_hold": False,
        "review_status": "pending",
        "redaction_required": False,
        "document_family_id": None,
        "attachment_count": 0,
        "file_size_kb": 25.0,
        "language": "en",
        "jurisdiction": "New York, USA",
    }
    rec.update(overrides)
    return rec


class TestValidation:
    """Tests for validate_dataset."""

    def test_perfect_dataset(self):
        records = [_make_valid_record(i) for i in range(50)]
        report = validate_dataset(records, dataset_id="test-123")
        assert report.quality_score >= 0.9
        assert report.breakdown.schema_validity == 1.0
        assert report.breakdown.completeness == 1.0
        assert report.breakdown.uniqueness == 1.0

    def test_empty_dataset(self):
        report = validate_dataset([], dataset_id="empty")
        assert report.quality_score == 0.0
        assert report.total_records == 0

    def test_duplicate_document_ids(self):
        records = [_make_valid_record(0) for _ in range(10)]  # All same ID
        report = validate_dataset(records, dataset_id="dup-test")
        assert report.breakdown.uniqueness < 1.0
        assert any("duplicate" in issue.lower() for issue in report.issues)

    def test_missing_required_fields(self):
        records = [_make_valid_record(i) for i in range(10)]
        records[0]["custodian_role"] = ""  # Empty required field
        records[1]["jurisdiction"] = None  # Null required field
        report = validate_dataset(records, dataset_id="missing")
        assert report.breakdown.completeness < 1.0

    def test_invalid_enum_values(self):
        records = [_make_valid_record(i) for i in range(10)]
        records[0]["document_type"] = "invalid_type"
        records[1]["privilege_status"] = "maybe"
        report = validate_dataset(records, dataset_id="enum-test")
        assert report.breakdown.schema_validity < 1.0

    def test_invalid_dates(self):
        records = [_make_valid_record(i) for i in range(10)]
        # date_created after date_modified
        records[0]["date_created"] = datetime(2024, 6, 1, tzinfo=timezone.utc)
        records[0]["date_modified"] = datetime(2023, 1, 1, tzinfo=timezone.utc)
        report = validate_dataset(records, dataset_id="date-test")
        assert report.breakdown.schema_validity < 1.0

    def test_logical_consistency_email_channel(self):
        records = [_make_valid_record(i) for i in range(10)]
        # Non-email with a communication channel
        records[0]["document_type"] = "pdf"
        records[0]["communication_channel"] = "outlook"
        report = validate_dataset(records, dataset_id="logic-test")
        assert report.breakdown.logical_consistency < 1.0

    def test_distribution_adherence(self):
        records = [_make_valid_record(i, responsive=True) for i in range(100)]
        # All responsive, but target is 50%
        report = validate_dataset(records, dataset_id="dist-test", target_responsive_rate=0.5)
        assert report.breakdown.distribution_adherence < 1.0

    def test_quality_score_weights(self):
        """Verify the composite score is correctly weighted."""
        records = [_make_valid_record(i) for i in range(20)]
        report = validate_dataset(records, dataset_id="weight-test")
        expected = (
            report.breakdown.schema_validity * 0.25
            + report.breakdown.completeness * 0.25
            + report.breakdown.uniqueness * 0.20
            + report.breakdown.logical_consistency * 0.20
            + report.breakdown.distribution_adherence * 0.10
        )
        assert abs(report.quality_score - round(expected, 4)) < 0.001

    def test_negative_file_size(self):
        records = [_make_valid_record(i) for i in range(10)]
        records[0]["file_size_kb"] = -5.0
        report = validate_dataset(records, dataset_id="neg-size")
        assert report.breakdown.logical_consistency < 1.0
