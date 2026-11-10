"""Analytics and quality report endpoints."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Dataset, DocumentMetadata
from app.schemas import AnalyticsResponse, QualityReport
from app.services.analytics_service import compute_analytics
from app.services.validation import validate_dataset

logger = logging.getLogger(__name__)
router = APIRouter(tags=["analytics"])


@router.get("/datasets/{dataset_id}/analytics", response_model=AnalyticsResponse)
def get_analytics(dataset_id: str, db: Session = Depends(get_db)):
    """Compute and return analytics for a dataset."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return compute_analytics(dataset_id, db)


@router.get("/datasets/{dataset_id}/quality", response_model=QualityReport)
def get_quality(dataset_id: str, db: Session = Depends(get_db)):
    """Compute and return the quality report for a dataset."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    records = (
        db.query(DocumentMetadata)
        .filter(DocumentMetadata.dataset_id == dataset_id)
        .all()
    )

    # Convert ORM objects to dicts for the validator
    record_dicts = []
    for rec in records:
        d = {
            "document_id": rec.document_id,
            "case_id": rec.case_id,
            "document_type": rec.document_type,
            "custodian_id": rec.custodian_id,
            "custodian_role": rec.custodian_role,
            "fictional_custodian_name": rec.fictional_custodian_name,
            "fictional_organization": rec.fictional_organization,
            "date_created": rec.date_created,
            "date_modified": rec.date_modified,
            "file_type": rec.file_type,
            "communication_channel": rec.communication_channel,
            "confidentiality_level": rec.confidentiality_level,
            "privilege_status": rec.privilege_status,
            "responsive": rec.responsive,
            "issue_tags": rec.issue_tags or [],
            "legal_hold": rec.legal_hold,
            "review_status": rec.review_status,
            "redaction_required": rec.redaction_required,
            "document_family_id": rec.document_family_id,
            "attachment_count": rec.attachment_count,
            "file_size_kb": rec.file_size_kb,
            "language": rec.language,
            "jurisdiction": rec.jurisdiction,
        }
        record_dicts.append(d)

    report = validate_dataset(record_dicts, dataset_id=dataset_id)
    return report
