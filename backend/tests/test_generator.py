"""Tests for the synthetic data generator engine."""

from __future__ import annotations

import pytest

from app.schemas import GenerationRequest
from app.services.generator import SyntheticDataGenerator
from app.services.llm_service import MockLLMProvider


def _make_request(**overrides) -> GenerationRequest:
    """Create a GenerationRequest with sensible defaults."""
    defaults = {
        "name": "Test",
        "scenario": "corporate_fraud",
        "num_records": 100,
        "complexity": "intermediate",
        "document_types": ["email", "pdf", "docx"],
        "classification_distribution": "realistic",
        "seed": 42,
        "generation_method": "rule-based",
    }
    defaults.update(overrides)
    return GenerationRequest(**defaults)


def _get_profile(scenario="corporate_fraud", complexity="intermediate"):
    provider = MockLLMProvider()
    return provider.generate_scenario_profile(scenario, complexity)


class TestSyntheticDataGenerator:
    """Tests for the core generator."""

    def test_generates_correct_number_of_records(self):
        request = _make_request(num_records=100)
        profile = _get_profile()
        gen = SyntheticDataGenerator(request=request, profile=profile)
        records = gen.generate_all()
        assert len(records) == 100

    def test_generates_500_records(self):
        request = _make_request(num_records=500)
        profile = _get_profile()
        gen = SyntheticDataGenerator(request=request, profile=profile)
        records = gen.generate_all()
        assert len(records) == 500

    def test_document_ids_are_unique(self):
        request = _make_request(num_records=500)
        profile = _get_profile()
        gen = SyntheticDataGenerator(request=request, profile=profile)
        records = gen.generate_all()
        ids = [r["document_id"] for r in records]
        assert len(ids) == len(set(ids)), "Duplicate document IDs found"

    def test_seed_reproducibility(self):
        """Same seed + config should produce identical datasets."""
        request = _make_request(seed=12345, num_records=100)
        profile = _get_profile()

        gen1 = SyntheticDataGenerator(request=request, profile=profile)
        records1 = gen1.generate_all()

        gen2 = SyntheticDataGenerator(request=request, profile=profile)
        records2 = gen2.generate_all()

        for r1, r2 in zip(records1, records2):
            assert r1["document_id"] == r2["document_id"]
            assert r1["custodian_role"] == r2["custodian_role"]
            assert r1["responsive"] == r2["responsive"]

    def test_only_requested_document_types(self):
        request = _make_request(document_types=["email", "contract"])
        profile = _get_profile()
        gen = SyntheticDataGenerator(request=request, profile=profile)
        records = gen.generate_all()
        types = {r["document_type"] for r in records}
        assert types <= {"email", "contract"}

    def test_balanced_distribution(self):
        request = _make_request(
            num_records=1000, classification_distribution="balanced", seed=99
        )
        profile = _get_profile()
        gen = SyntheticDataGenerator(request=request, profile=profile)
        records = gen.generate_all()
        responsive_count = sum(1 for r in records if r["responsive"])
        rate = responsive_count / len(records)
        assert 0.40 <= rate <= 0.60, f"Balanced distribution out of range: {rate:.2f}"

    def test_all_records_have_required_fields(self):
        request = _make_request(num_records=100)
        profile = _get_profile()
        gen = SyntheticDataGenerator(request=request, profile=profile)
        records = gen.generate_all()

        required = [
            "document_id", "case_id", "document_type", "custodian_id",
            "custodian_role", "fictional_custodian_name", "fictional_organization",
            "date_created", "date_modified", "file_type", "confidentiality_level",
            "privilege_status", "responsive", "issue_tags", "legal_hold",
            "review_status", "redaction_required", "attachment_count",
            "file_size_kb", "language", "jurisdiction",
        ]
        for rec in records:
            for field in required:
                assert field in rec, f"Missing field: {field}"

    def test_emails_have_communication_channel(self):
        request = _make_request(document_types=["email"], num_records=100)
        profile = _get_profile()
        gen = SyntheticDataGenerator(request=request, profile=profile)
        records = gen.generate_all()
        for rec in records:
            assert rec["communication_channel"] is not None

    def test_non_emails_no_communication_channel(self):
        request = _make_request(document_types=["pdf", "contract"], num_records=100)
        profile = _get_profile()
        gen = SyntheticDataGenerator(request=request, profile=profile)
        records = gen.generate_all()
        for rec in records:
            assert rec["communication_channel"] is None

    def test_date_created_before_date_modified(self):
        request = _make_request(num_records=200)
        profile = _get_profile()
        gen = SyntheticDataGenerator(request=request, profile=profile)
        records = gen.generate_all()
        for rec in records:
            assert rec["date_created"] <= rec["date_modified"]

    def test_file_size_positive(self):
        request = _make_request(num_records=100)
        profile = _get_profile()
        gen = SyntheticDataGenerator(request=request, profile=profile)
        records = gen.generate_all()
        for rec in records:
            assert rec["file_size_kb"] > 0

    def test_different_scenarios(self):
        """Verify all scenario types produce valid records."""
        scenarios = [
            "corporate_fraud", "ip_dispute", "employment_litigation",
            "financial_misconduct", "contract_dispute", "custom",
        ]
        for scenario in scenarios:
            request = _make_request(scenario=scenario, num_records=100)
            profile = _get_profile(scenario=scenario)
            gen = SyntheticDataGenerator(request=request, profile=profile)
            records = gen.generate_all()
            assert len(records) == 100, f"Failed for scenario {scenario}"
