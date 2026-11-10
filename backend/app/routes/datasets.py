"""Dataset CRUD and record retrieval endpoints."""

from __future__ import annotations

import logging
import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Dataset, DocumentMetadata
from app.schemas import (
    DatasetListResponse,
    DatasetResponse,
    DocumentMetadataResponse,
    PaginatedResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["datasets"])


@router.get("/datasets", response_model=PaginatedResponse[DatasetListResponse])
def list_datasets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all datasets with pagination, most recent first."""
    total = db.query(func.count(Dataset.id)).scalar() or 0
    datasets = (
        db.query(Dataset)
        .order_by(Dataset.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return PaginatedResponse(
        page=page,
        page_size=page_size,
        total=total,
        items=[DatasetListResponse.model_validate(ds) for ds in datasets],
    )


@router.get("/datasets/{dataset_id}", response_model=DatasetResponse)
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Get detailed information about a specific dataset."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset


@router.get(
    "/datasets/{dataset_id}/records",
    response_model=PaginatedResponse[DocumentMetadataResponse],
)
def get_dataset_records(
    dataset_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    document_type: str | None = Query(None),
    responsive: str | None = Query(None),
    privilege_status: str | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """Retrieve paginated records for a dataset with optional filters."""
    # Verify dataset exists
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    query = db.query(DocumentMetadata).filter(
        DocumentMetadata.dataset_id == dataset_id
    )

    # Apply filters
    if document_type:
        query = query.filter(DocumentMetadata.document_type == document_type)
    if responsive is not None and responsive != "":
        if responsive.lower() in ("true", "1"):
            query = query.filter(DocumentMetadata.responsive == True)  # noqa: E712
        elif responsive.lower() in ("false", "0"):
            query = query.filter(DocumentMetadata.responsive == False)  # noqa: E712
    if privilege_status:
        query = query.filter(DocumentMetadata.privilege_status == privilege_status)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (DocumentMetadata.document_id.ilike(pattern))
            | (DocumentMetadata.fictional_custodian_name.ilike(pattern))
            | (DocumentMetadata.fictional_organization.ilike(pattern))
        )

    total = query.count()
    records = (
        query.order_by(DocumentMetadata.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        page=page,
        page_size=page_size,
        total=total,
        items=[DocumentMetadataResponse.model_validate(r) for r in records],
    )


@router.delete("/datasets/{dataset_id}", status_code=204)
def delete_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Delete a dataset and all its records."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    db.delete(dataset)
    db.commit()
    return None
