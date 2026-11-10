"""Dataset CRUD and record retrieval endpoints with user ownership enforcement."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import AuthenticatedUser, get_current_user
from app.database import get_db
from app.models import Dataset, DocumentMetadata, GenerationHistory
from app.schemas import (
    DatasetListResponse,
    DatasetResponse,
    DocumentMetadataResponse,
    GenerationHistoryResponse,
    PaginatedResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["datasets"])


@router.get("/datasets", response_model=PaginatedResponse[DatasetListResponse])
def list_datasets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """List datasets owned by the current authenticated user, most recent first."""
    # Enforce strict user isolation: only fetch datasets belonging to current_user
    query = db.query(Dataset).filter(Dataset.user_id == current_user.id)
    total = query.with_entities(func.count(Dataset.id)).scalar() or 0

    datasets = (
        query.order_by(Dataset.created_at.desc())
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
def get_dataset(
    dataset_id: str,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Get detailed information about a specific dataset, verifying user ownership."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    if dataset.user_id is not None and dataset.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to access this dataset",
        )

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
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Retrieve paginated records for a dataset with optional filters, verifying user ownership."""
    # Verify dataset exists and current_user owns it
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    if dataset.user_id is not None and dataset.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to access these records",
        )

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
def delete_dataset(
    dataset_id: str,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Delete a dataset and all its records, verifying ownership before deletion."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    if dataset.user_id is not None and dataset.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You cannot delete a dataset you do not own",
        )

    db.delete(dataset)
    db.commit()
    return None


@router.get("/history", response_model=PaginatedResponse[GenerationHistoryResponse])
def list_generation_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """List generation audit logs for current authenticated user."""
    query = db.query(GenerationHistory).filter(GenerationHistory.user_id == current_user.id)
    total = query.with_entities(func.count(GenerationHistory.id)).scalar() or 0

    items = (
        query.order_by(GenerationHistory.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        page=page,
        page_size=page_size,
        total=total,
        items=[GenerationHistoryResponse.model_validate(h) for h in items],
    )
