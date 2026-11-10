"""Dataset generation endpoint — POST /api/generate."""

from __future__ import annotations

import logging
import traceback

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import AuthenticatedUser, get_current_user
from app.database import get_db
from app.models import Dataset, DocumentMetadata, GenerationHistory
from app.schemas import DatasetResponse, GenerationRequest
from app.services.generator import SyntheticDataGenerator
from app.services.llm_service import get_llm_provider
from app.services.scenario_engine import get_scenario_profile
from app.services.validation import validate_dataset

logger = logging.getLogger(__name__)
router = APIRouter(tags=["generate"])


@router.post("/generate", response_model=DatasetResponse, status_code=201)
def generate_dataset(
    request: GenerationRequest,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Generate a new synthetic litigation metadata dataset scoped to current authenticated user.

    This endpoint:
    1. Derives user_id from verified JWT (never from client request body).
    2. Creates a Dataset record owned by current_user.
    3. Obtains a scenario profile (via LLM or rule-based fallback).
    4. Generates synthetic records using the hybrid engine.
    5. Validates the dataset and computes a quality score.
    6. Persists records and records generation audit history.
    """
    # Validate num_records
    allowed_sizes = {100, 500, 1000, 5000}
    if request.num_records not in allowed_sizes:
        raise HTTPException(
            status_code=400,
            detail=f"num_records must be one of {sorted(allowed_sizes)}",
        )

    # Create dataset record with verified user ownership
    dataset = Dataset(
        user_id=current_user.id,
        name=request.name,
        scenario=request.scenario.value,
        num_records=request.num_records,
        complexity=request.complexity.value,
        generation_method=request.generation_method.value,
        status="generating",
        seed=request.seed,
        config_json=request.model_dump(mode="json"),
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    try:
        # Get scenario profile
        provider = get_llm_provider()
        actual_method = request.generation_method.value

        profile = get_scenario_profile(
            scenario=request.scenario.value,
            complexity=request.complexity.value,
            generation_method=actual_method,
            provider=provider,
        )

        # Generate records
        generator = SyntheticDataGenerator(request=request, profile=profile)
        raw_records = generator.generate_all()

        # Validate
        target_rate = None
        if request.classification_distribution.value == "custom" and request.custom_responsive_pct is not None:
            target_rate = request.custom_responsive_pct
        elif request.classification_distribution.value == "balanced":
            target_rate = 0.50
        else:
            target_rate = profile.responsiveness_rate

        quality_report = validate_dataset(
            raw_records, dataset_id=dataset.id, target_responsive_rate=target_rate
        )

        # Persist records in batches
        BATCH_SIZE = 500
        for i in range(0, len(raw_records), BATCH_SIZE):
            batch = raw_records[i : i + BATCH_SIZE]
            db_records = [
                DocumentMetadata(dataset_id=dataset.id, **rec) for rec in batch
            ]
            db.bulk_save_objects(db_records)
            db.flush()

        # Update dataset status and quality score
        dataset.status = "completed"
        dataset.quality_score = round(quality_report.quality_score * 100, 1)
        dataset.seed = generator.seed

        # Record generation history entry
        history_entry = GenerationHistory(
            user_id=current_user.id,
            dataset_id=dataset.id,
            generation_status="completed",
            generation_config=request.model_dump(mode="json"),
        )
        db.add(history_entry)

        db.commit()
        db.refresh(dataset)

        logger.info(
            "Dataset '%s' (owner=%s) generated: %d records, quality=%.1f%%",
            dataset.name,
            current_user.id,
            len(raw_records),
            dataset.quality_score,
        )

    except Exception as exc:
        logger.error("Generation failed for dataset %s: %s", dataset.id, exc)
        logger.debug(traceback.format_exc())
        dataset.status = "failed"
        # Record failed history
        try:
            failed_entry = GenerationHistory(
                user_id=current_user.id,
                dataset_id=dataset.id,
                generation_status="failed",
                generation_config=request.model_dump(mode="json"),
            )
            db.add(failed_entry)
            db.commit()
        except Exception:
            db.rollback()

        raise HTTPException(status_code=500, detail=f"Generation failed: {str(exc)}")

    return dataset
