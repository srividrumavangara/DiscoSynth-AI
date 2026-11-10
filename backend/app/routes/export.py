"""Export endpoints — CSV and JSON downloads."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

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
):
    """Export a dataset as CSV or JSON.

    Query Parameters
    ----------------
    format : str
        ``csv`` (default) or ``json``.
    """
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

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
