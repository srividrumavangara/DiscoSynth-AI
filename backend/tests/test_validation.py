import pytest
from app.services.validation_service import ValidationService
from app.schemas.generation import GenerationConfig, DateRange
from app.schemas.metadata_record import DocumentMetadata

def test_parse_iso_date():
    dt = ValidationService.parse_iso_date("2023-05-15")
    assert dt is not None
    assert dt.year == 2023
    assert dt.month == 5
    assert dt.day == 15

    dt2 = ValidationService.parse_iso_date("2023-11-20T14:30:00Z")
    assert dt2 is not None
    assert dt2.year == 2023
    assert dt2.hour == 14

def test_validation_batch_valid():
    config = GenerationConfig(
        scenario_type="Corporate Fraud",
        size=5,
        date_range=DateRange(start="2022-01-01", end="2024-12-31"),
        document_categories=["Emails", "Contracts"]
    )
    existing_ids = set()
    raw_records = [
        {
            "doc_id": "DS-TEST-0001",
            "filename": "email_audit_q3.msg",
            "title": "Discussion on Q3 audit findings",
            "doc_type": "Emails",
            "file_extension": "msg",
            "file_size_kb": 120,
            "creation_date": "2023-04-12T10:00:00Z",
            "modified_date": "2023-04-12T10:00:00Z",
            "custodian": "Arthur Vance (CFO)",
            "sender": "a.vance@acme.internal",
            "recipients": ["counsel@legal.internal"],
            "source_system": "Microsoft Exchange",
            "confidentiality_level": "Confidential",
            "privilege_status": "Attorney-Client",
            "privilege_basis": "Seeking advice regarding restatement risk",
            "responsiveness": "Responsive",
            "issue_tags": ["Audit", "Q3 Variance"],
            "litigation_scenario": "Corporate Fraud",
            "synthetic_marker": "SYNTHETIC_EVAL_RECORD"
        }
    ]

    valid, invalid, errors = ValidationService.validate_batch(raw_records, config, existing_ids)
    assert len(valid) == 1
    assert len(invalid) == 0
    assert len(errors) == 0
    assert valid[0].doc_id == "DS-TEST-0001"

def test_validation_date_out_of_bounds():
    config = GenerationConfig(
        scenario_type="Corporate Fraud",
        date_range=DateRange(start="2022-01-01", end="2023-12-31")
    )
    existing_ids = set()
    raw_records = [
        {
            "doc_id": "DS-TEST-0002",
            "filename": "email_future.msg",
            "title": "Future email",
            "doc_type": "Emails",
            "file_extension": "msg",
            "file_size_kb": 50,
            "creation_date": "2025-06-01",  # Out of range
            "modified_date": "2025-06-01",
            "custodian": "Arthur Vance",
            "source_system": "Exchange",
            "confidentiality_level": "Public",
            "privilege_status": "Not Privileged",
            "privilege_basis": None,
            "responsiveness": "Non-Responsive",
            "issue_tags": [],
            "litigation_scenario": "Corporate Fraud"
        }
    ]

    valid, invalid, errors = ValidationService.validate_batch(raw_records, config, existing_ids)
    assert len(valid) == 0
    assert len(invalid) == 1
    assert any("falls outside configured range" in e for e in errors)

def test_privilege_basis_required_when_privileged():
    config = GenerationConfig(
        scenario_type="Corporate Fraud",
        date_range=DateRange(start="2022-01-01", end="2024-12-31")
    )
    existing_ids = set()
    raw_records = [
        {
            "doc_id": "DS-TEST-0003",
            "filename": "memo.pdf",
            "title": "Legal memo",
            "doc_type": "Emails",
            "file_extension": "pdf",
            "file_size_kb": 250,
            "creation_date": "2023-01-15",
            "modified_date": "2023-01-15",
            "custodian": "Arthur Vance",
            "source_system": "Exchange",
            "confidentiality_level": "Confidential",
            "privilege_status": "Attorney-Client",
            "privilege_basis": "",  # Missing basis
            "responsiveness": "Responsive",
            "issue_tags": [],
            "litigation_scenario": "Corporate Fraud"
        }
    ]

    valid, invalid, errors = ValidationService.validate_batch(raw_records, config, existing_ids)
    assert len(valid) == 0
    assert len(invalid) == 1
    assert any("missing privilege_basis rationale" in e for e in errors)
