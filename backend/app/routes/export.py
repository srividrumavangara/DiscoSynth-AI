"""Export endpoints — CSV and JSON downloads with user ownership verification."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth import AuthenticatedUser, get_current_user
from app.database import get_db
from app.models import Dataset, DocumentMetadata
from app.services.export_service import export_csv, export_json

logger = logging.getLogger(__name__)
router = APIRouter(tags=["export"])


@router.get("/datasets/{dataset_id}/export")
def export_dataset(
    dataset_id: str,
    format: str = Query("csv", pattern="^(csv|json)$"),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Export a dataset as CSV or JSON, verifying user ownership.

    Supports Authorization header and ?token=<jwt> query parameter for browser downloads.
    """
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    if dataset.user_id is not None and dataset.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to export this dataset",
        )

    records = (
        db.query(DocumentMetadata)
        .filter(DocumentMetadata.dataset_id == dataset_id)
        .order_by(DocumentMetadata.id)
        .all()
    )

    if not records:
        raise HTTPException(status_code=404, detail="No records found for this dataset")

    if format == "json":
        return export_json(dataset, records)
    return export_csv(dataset, records)
