from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
import logging
from app.schemas.metadata_record import DocumentMetadata
from app.schemas.generation import GenerationConfig

logger = logging.getLogger(__name__)

class ValidationService:
    @staticmethod
    def parse_iso_date(date_str: str) -> Optional[datetime]:
        if not date_str:
            return None
        formats = [
            "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d",
            "%Y/%m/%d",
        ]
        # Clean potential trailing Z or subseconds
        clean_str = date_str.strip()
        if "." in clean_str:
            clean_str = clean_str.split(".")[0]
            if not clean_str.endswith("Z") and date_str.endswith("Z"):
                clean_str += "Z"

        for fmt in formats:
            try:
                return datetime.strptime(clean_str, fmt)
            except ValueError:
                continue
        return None

    @classmethod
    def validate_batch(
        cls,
        raw_records: List[Dict[str, Any]],
        config: GenerationConfig,
        existing_doc_ids: set
    ) -> Tuple[List[DocumentMetadata], List[Dict[str, Any]], List[str]]:
        valid_records: List[DocumentMetadata] = []
        invalid_records: List[Dict[str, Any]] = []
        error_messages: List[str] = []

        start_dt = cls.parse_iso_date(config.date_range.start)
        end_dt = cls.parse_iso_date(config.date_range.end)

        allowed_categories = set(config.document_categories)
        valid_privileges = {"Not Privileged", "Attorney-Client", "Work Product", "Joint Defense"}
        valid_responsiveness = {"Responsive", "Non-Responsive"}

        for idx, rec in enumerate(raw_records):
            doc_id = rec.get("doc_id", f"UNKNOWN-{idx}")
            record_errors = []

            # 1. Pydantic validation
            try:
                # Ensure synthetic marker
                if "synthetic_marker" not in rec:
                    rec["synthetic_marker"] = "SYNTHETIC_EVAL_RECORD"
                validated = DocumentMetadata(**rec)
            except Exception as e:
                record_errors.append(f"Doc {doc_id}: Schema validation error: {str(e)}")
                invalid_records.append(rec)
                error_messages.extend(record_errors)
                continue

            # 2. Duplicate Doc ID check
            if validated.doc_id in existing_doc_ids:
                record_errors.append(f"Doc {validated.doc_id}: Duplicate document ID detected.")
            else:
                existing_doc_ids.add(validated.doc_id)

            # 3. Date range validation
            doc_dt = cls.parse_iso_date(validated.creation_date)
            if not doc_dt:
                record_errors.append(f"Doc {validated.doc_id}: Invalid creation_date format '{validated.creation_date}'.")
            elif start_dt and end_dt:
                if doc_dt < start_dt or doc_dt > end_dt:
                    record_errors.append(
                        f"Doc {validated.doc_id}: creation_date {validated.creation_date} falls outside "
                        f"configured range ({config.date_range.start} to {config.date_range.end})."
                    )

            # 4. Privilege consistency
            if validated.privilege_status not in valid_privileges:
                # normalize if possible
                if "attorney" in validated.privilege_status.lower():
                    validated.privilege_status = "Attorney-Client"
                elif "work" in validated.privilege_status.lower():
                    validated.privilege_status = "Work Product"
                elif "not" in validated.privilege_status.lower():
                    validated.privilege_status = "Not Privileged"
                else:
                    record_errors.append(f"Doc {validated.doc_id}: Unrecognized privilege status '{validated.privilege_status}'.")

            if validated.privilege_status != "Not Privileged" and not validated.privilege_basis:
                record_errors.append(f"Doc {validated.doc_id}: Privileged document missing privilege_basis rationale.")
            elif validated.privilege_status == "Not Privileged" and validated.privilege_basis:
                # Clean up if set
                validated.privilege_basis = None

            # 5. Responsiveness
            if validated.responsiveness not in valid_responsiveness:
                if "non" in validated.responsiveness.lower():
                    validated.responsiveness = "Non-Responsive"
                elif "resp" in validated.responsiveness.lower():
                    validated.responsiveness = "Responsive"
                else:
                    record_errors.append(f"Doc {validated.doc_id}: Invalid responsiveness '{validated.responsiveness}'.")

            if record_errors:
                invalid_records.append(rec)
                error_messages.extend(record_errors)
            else:
                valid_records.append(validated)

        return valid_records, invalid_records, error_messages
