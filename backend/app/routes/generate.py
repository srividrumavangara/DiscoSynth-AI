"""Dataset generation endpoint — POST /api/generate."""

from __future__ import annotations

import logging
import traceback

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Dataset, DocumentMetadata
from app.schemas import DatasetResponse, GenerationRequest
from app.services.generator import SyntheticDataGenerator
from app.services.llm_service import get_llm_provider
from app.services.scenario_engine import get_scenario_profile
from app.services.validation import validate_dataset

logger = logging.getLogger(__name__)
router = APIRouter(tags=["generate"])


@router.post("/generate", response_model=DatasetResponse, status_code=201)
def generate_dataset(request: GenerationRequest, db: Session = Depends(get_db)):
    """Generate a new synthetic litigation metadata dataset.

    This endpoint:
    1. Creates a Dataset record in pending state.
    2. Obtains a scenario profile (via LLM or rule-based fallback).
    3. Generates synthetic records using the hybrid engine.
    4. Validates the dataset and computes a quality score.
    5. Persists all records and updates the dataset status.
    """
    # Validate num_records
    allowed_sizes = {100, 500, 1000, 5000}
    if request.num_records not in allowed_sizes:
        raise HTTPException(
            status_code=400,
            detail=f"num_records must be one of {sorted(allowed_sizes)}",
        )

    # Create dataset record
    dataset = Dataset(
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

        # Update dataset
        dataset.status = "completed"
        dataset.quality_score = round(quality_report.quality_score * 100, 1)
        dataset.seed = generator.seed
        db.commit()
        db.refresh(dataset)

        logger.info(
            "Dataset '%s' generated: %d records, quality=%.1f%%",
            dataset.name,
            len(raw_records),
            dataset.quality_score,
        )

    except Exception as exc:
        logger.error("Generation failed for dataset %s: %s", dataset.id, exc)
        logger.debug(traceback.format_exc())
        dataset.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(exc)}")

    return dataset
