"""Export service — CSV and JSON streaming exports for DiscoSynth AI."""

from __future__ import annotations

import io
import json
import logging
from datetime import datetime, timezone
from typing import Any

import pandas as pd
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.models import Dataset, DocumentMetadata

logger = logging.getLogger(__name__)

# Columns to include in the export (order matters for CSV readability)
_EXPORT_COLUMNS = [
    "document_id", "case_id", "document_type", "custodian_id",
    "custodian_role", "fictional_custodian_name", "fictional_organization",
    "date_created", "date_modified", "file_type", "communication_channel",
    "confidentiality_level", "privilege_status", "responsive", "issue_tags",
    "legal_hold", "review_status", "redaction_required",
    "document_family_id", "attachment_count", "file_size_kb",
    "language", "jurisdiction",
]


def _records_to_dicts(records: list[DocumentMetadata]) -> list[dict[str, Any]]:
    """Convert ORM records to plain dicts suitable for export."""
    rows: list[dict[str, Any]] = []
    for rec in records:
        row: dict[str, Any] = {}
        for col in _EXPORT_COLUMNS:
            val = getattr(rec, col, None)
            if isinstance(val, datetime):
                val = val.isoformat()
            elif isinstance(val, list):
                val = "; ".join(str(v) for v in val)
            row[col] = val
        rows.append(row)
    return rows


def _build_manifest(dataset: Dataset, total_records: int) -> dict[str, Any]:
    """Build a manifest dict with dataset metadata."""
    return {
        "dataset_id": dataset.id,
        "dataset_name": dataset.name,
        "scenario": dataset.scenario,
        "complexity": dataset.complexity,
        "generation_method": dataset.generation_method,
        "total_records": total_records,
        "quality_score": dataset.quality_score,
        "seed": dataset.seed,
        "created_at": dataset.created_at.isoformat() if dataset.created_at else None,
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "disclaimer": "This dataset is entirely synthetic and fictional. It is intended for e-discovery testing only.",
    }


def export_csv(dataset: Dataset, records: list[DocumentMetadata]) -> StreamingResponse:
    """Generate a streaming CSV response.

    Parameters
    ----------
    dataset:
        The parent ``Dataset`` ORM object.
    records:
        List of ``DocumentMetadata`` ORM objects to export.
    """
    rows = _records_to_dicts(records)
    df = pd.DataFrame(rows, columns=_EXPORT_COLUMNS)

    buf = io.StringIO()
    # Write manifest as a comment header
    manifest = _build_manifest(dataset, len(records))
    buf.write(f"# DiscoSynth AI Export — {manifest['dataset_name']}\n")
    buf.write(f"# Dataset ID: {manifest['dataset_id']}\n")
    buf.write(f"# Scenario: {manifest['scenario']} | Records: {manifest['total_records']}\n")
    buf.write(f"# Exported: {manifest['exported_at']}\n")
    buf.write(f"# DISCLAIMER: {manifest['disclaimer']}\n")
    df.to_csv(buf, index=False)
    buf.seek(0)

    filename = f"discosynth_{dataset.id[:8]}.csv"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def export_json(dataset: Dataset, records: list[DocumentMetadata]) -> StreamingResponse:
    """Generate a streaming JSON response.

    Parameters
    ----------
    dataset:
        The parent ``Dataset`` ORM object.
    records:
        List of ``DocumentMetadata`` ORM objects to export.
    """
    rows = _records_to_dicts(records)
    manifest = _build_manifest(dataset, len(records))

    payload = {
        "manifest": manifest,
        "records": rows,
    }

    content = json.dumps(payload, indent=2, default=str)
    filename = f"discosynth_{dataset.id[:8]}.json"
    return StreamingResponse(
        iter([content]),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
