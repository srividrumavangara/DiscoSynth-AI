import time
import uuid
import math
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from app.schemas.generation import GenerationConfig
from app.schemas.metadata_record import DocumentMetadata
from app.schemas.dataset import DatasetDetail, ValidationStatus, ModelInfo
from app.services.gemini_service import gemini_service
from app.services.prompt_service import PromptService
from app.services.validation_service import ValidationService
from app.database import get_database

logger = logging.getLogger(__name__)

class GenerationService:
    MAX_BATCH_SIZE = 25
    MAX_CORRECTION_RETRIES = 2

    @staticmethod
    def _generate_fictional_context(config: GenerationConfig) -> Dict[str, Any]:
        """Creates coherent fictional entities, custodians, and titles tailored to scenario."""
        scenario = config.scenario_type
        year = config.date_range.start[:4] if config.date_range.start else "2023"

        scenario_context_map = {
            "Corporate Fraud": {
                "entities": ["Aegis Financial Partners", "Meridian Global Holding", "Apex Capital LLC", "SEC Enforcement Division"],
                "custodians": [
                    "Marcus Vance (Chief Financial Officer)",
                    "Dr. Elena Vance (EVP Strategic Finance)",
                    "Richard Sterling (Partner, Outside Legal Counsel)",
                    "Clara Hughes (VP Internal Audit)",
                    "David Keller (Senior Controller)",
                    "Samantha Lin (Chief Executive Officer)"
                ],
                "case_title": f"In re Meridian Global Securities & Accounting Litigation ({year})"
            },
            "Intellectual Property Dispute": {
                "entities": ["Synapse Neural Tech Inc.", "NeuroMatrix Solutions Ltd.", "USPTO", "Federal Circuit District"],
                "custodians": [
                    "Dr. Julian Thorne (Lead Research Scientist)",
                    "Maya Patel (VP of Engineering)",
                    "Geoffrey Hayes (Chief IP Counsel)",
                    "Alexander Brody (Product Architect)",
                    "Sarah Jenkins (Director of Software Development)"
                ],
                "case_title": f"Synapse Neural Tech v. NeuroMatrix Solutions – Patent & Trade Secret Action ({year})"
            },
            "Employment Litigation": {
                "entities": ["Summit Logistics Corp.", "Equal Employment Opportunity Division", "Pacific State Operations"],
                "custodians": [
                    "Chloe Davenport (Head of Global HR)",
                    "Victor Ramos (Regional Director of Operations)",
                    "Hannah Cole (Associate General Counsel - Employment)",
                    "Kenneth Wright (Senior Operations Manager)",
                    "Natalie Zhao (Former Director of Sales)"
                ],
                "case_title": f"Davenport et al. v. Summit Logistics – Fair Labor Standards & Retaliation Action ({year})"
            },
            "Contract Dispute": {
                "entities": ["Starlight Aerospace Corp.", "Vanguard Defense Systems", "Commercial Arbitration Tribunal"],
                "custodians": [
                    "Captain Robert Mercer (Procurement Director)",
                    "Evelyn Shaw (VP Contract Administration)",
                    "Jonathan Drake (Commercial Contracts Counsel)",
                    "Brian O'Connor (Program Delivery Lead)",
                    "Angela Miller (Chief Operating Officer)"
                ],
                "case_title": f"Starlight Aerospace v. Vanguard Defense – Material Breach & Liquidated Damages ({year})"
            },
            "Financial Misconduct": {
                "entities": ["Beacon Wealth Advisors", "Ironwood Capital Management", "FINRA Regulatory Review"],
                "custodians": [
                    "Leonard Briggs (Managing Partner - Trading)",
                    "Isabella Rossi (Chief Compliance Officer)",
                    "Thomas Burke (Managing Director, Fixed Income)",
                    "Rachel Stern (External Regulatory Counsel)",
                    "Paul Henderson (Chief Investment Officer)"
                ],
                "case_title": f"In re Beacon Wealth Structured Products & FINRA Inquiry ({year})"
            },
            "Regulatory Investigation": {
                "entities": ["OmniCare Health Systems", "Department of Health & Human Services OIG", "BioAdvance Labs"],
                "custodians": [
                    "Dr. Raymond Cruz (Chief Medical Officer)",
                    "Katherine Walsh (VP Regulatory Affairs & Compliance)",
                    "Benjamin Foster (Healthcare Regulatory Counsel)",
                    "Denise Young (Director of Clinical Trials)",
                    "Arthur Bell (Chief Executive Officer)"
                ],
                "case_title": f"HHS-OIG Investigation into OmniCare Billing & Regulatory Compliance ({year})"
            }
        }

        ctx = scenario_context_map.get(scenario, {
            "entities": ["Alpha Enterprises Inc.", "Beta Technologies Corp.", "Commercial District Court"],
            "custodians": [
                "Morgan Reed (Chief Executive Officer)",
                "Jordan Taylor (Chief Financial Officer)",
                "Taylor Morgan (General Counsel)",
                "Alexis Smith (VP Operations)"
            ],
            "case_title": f"{config.custom_scenario_details or scenario} Litigation ({year})"
        })

        # Slice custodians to match requested count
        custodians = ctx["custodians"][:config.custodian_count]
        if len(custodians) < config.custodian_count:
            for i in range(len(custodians) + 1, config.custodian_count + 1):
                custodians.append(f"Custodian {i} (Senior Manager)")

        return {
            "entities": ctx["entities"],
            "custodians": custodians,
            "case_title": ctx["case_title"]
        }

    @classmethod
    def generate_dataset(cls, config: GenerationConfig) -> DatasetDetail:
        start_time = time.time()
        start_iso = datetime.now(timezone.utc).isoformat()
        random_suffix = uuid.uuid4().hex[:5].upper()
        dataset_id = f"DS-{datetime.now().strftime('%Y')}-{random_suffix}"
        
        fictional_context = cls._generate_fictional_context(config)
        dataset_name = fictional_context["case_title"]

        total_requested = config.size
        batch_count = math.ceil(total_requested / cls.MAX_BATCH_SIZE)
        
        all_valid_records: List[DocumentMetadata] = []
        all_warnings: List[str] = []
        existing_doc_ids = set()
        system_prompt = PromptService.get_system_prompt()

        current_doc_number = 1

        for batch_idx in range(batch_count):
            remaining = total_requested - len(all_valid_records)
            current_batch_size = min(cls.MAX_BATCH_SIZE, remaining)
            if current_batch_size <= 0:
                break

            prompt = PromptService.build_metadata_batch_prompt(
                config=config,
                batch_index=batch_idx,
                batch_size=current_batch_size,
                start_id_number=current_doc_number,
                dataset_prefix=dataset_id,
                fictional_context=fictional_context
            )

            # Call Gemini
            response_json = gemini_service.generate_json(
                prompt=prompt,
                system_instruction=system_prompt
            )

            raw_records = response_json.get("records", [])
            if not isinstance(raw_records, list):
                if isinstance(response_json, list):
                    raw_records = response_json
                else:
                    raw_records = []

            # Validate batch
            valid_batch, invalid_batch, error_msgs = ValidationService.validate_batch(
                raw_records=raw_records,
                config=config,
                existing_doc_ids=existing_doc_ids
            )

            # If errors exist, attempt targeted correction
            if invalid_batch and cls.MAX_CORRECTION_RETRIES > 0:
                logger.info("Batch %d had %d invalid records. Attempting correction with Gemini...", batch_idx + 1, len(invalid_batch))
                for retry in range(cls.MAX_CORRECTION_RETRIES):
                    try:
                        corr_prompt = PromptService.build_correction_prompt(invalid_batch, error_msgs)
                        repaired_json = gemini_service.generate_json(corr_prompt, system_instruction=system_prompt)
                        repaired_raw = repaired_json.get("records", [])
                        rep_valid, rep_invalid, rep_errors = ValidationService.validate_batch(
                            raw_records=repaired_raw,
                            config=config,
                            existing_doc_ids=existing_doc_ids
                        )
                        valid_batch.extend(rep_valid)
                        invalid_batch = rep_invalid
                        error_msgs = rep_errors
                        if not invalid_batch:
                            break
                    except Exception as err:
                        logger.warning("Correction attempt %d failed: %s", retry + 1, err)

            if invalid_batch:
                warning_msg = f"Batch {batch_idx + 1}: {len(invalid_batch)} records failed validation after retry and were excluded."
                all_warnings.append(warning_msg)

            all_valid_records.extend(valid_batch)
            current_doc_number += len(valid_batch)

        total_duration = round(time.time() - start_time, 2)
        now_iso = datetime.now(timezone.utc).isoformat()

        validation_status = ValidationStatus(
            is_valid=len(all_warnings) == 0,
            checked_records=len(all_valid_records),
            error_count=len(all_warnings),
            warnings=all_warnings
        )

        model_info = ModelInfo(
            provider="Google Gemini",
            model_name=gemini_service.active_model,
            batches_generated=batch_count,
            total_duration_sec=total_duration
        )

        dataset = DatasetDetail(
            dataset_id=dataset_id,
            name=dataset_name,
            scenario_type=config.scenario_type,
            description=config.additional_instructions or f"Synthetic e-discovery litigation dataset for {config.scenario_type}",
            parameters=config,
            document_count=len(all_valid_records),
            records=all_valid_records,
            validation_status=validation_status,
            model_info=model_info,
            created_at=now_iso,
            updated_at=now_iso
        )

        # Persist into MongoDB (datasets and generation_jobs collections)
        try:
            db = get_database()
            dataset_dict = dataset.model_dump()
            db.datasets.insert_one(dataset_dict)

            # Record generation job entry
            job_record = {
                "job_id": f"JOB-{uuid.uuid4().hex[:8].upper()}",
                "dataset_id": dataset_id,
                "generation_status": "completed" if len(all_valid_records) > 0 else "failed",
                "requested_document_count": total_requested,
                "completed_document_count": len(all_valid_records),
                "batch_progress": {
                    "batches_total": batch_count,
                    "records_generated": len(all_valid_records)
                },
                "error_details": all_warnings,
                "started_at": start_iso,
                "completed_at": now_iso
            }
            db.generation_jobs.insert_one(job_record)

            logger.info("Persisted dataset %s with %d records into MongoDB datasets & generation_jobs.", dataset_id, len(all_valid_records))
        except Exception as e:
            logger.error("Failed to persist dataset to MongoDB: %s", e)
            raise RuntimeError(f"Database persistence failure: {str(e)}")

        return dataset
