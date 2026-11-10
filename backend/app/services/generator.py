"""Core synthetic data generator for DiscoSynth AI.

Produces realistic litigation document metadata records driven by a
``ScenarioProfile`` and a ``GenerationRequest``.
"""

from __future__ import annotations

import hashlib
import logging
import math
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import numpy as np
from faker import Faker

from app.services.llm_service import ScenarioProfile
from app.schemas import GenerationRequest
from app.utils.enums import (
    ClassificationDistribution,
    ConfidentialityLevel,
    CustodianRole,
    PrivilegeStatus,
    ReviewStatus,
)
from app.services.scenario_engine import get_jurisdictions

logger = logging.getLogger(__name__)

# File-type mapping per document type
_FILE_TYPE_MAP: dict[str, str] = {
    "email": ".eml",
    "pdf": ".pdf",
    "docx": ".docx",
    "xlsx": ".xlsx",
    "internal_memo": ".docx",
    "financial_report": ".xlsx",
    "contract": ".pdf",
}

# Communication channel for emails
_COMM_CHANNELS: list[str] = ["outlook", "gmail", "exchange", "lotus_notes"]

# Log-normal file-size parameters (mean_kb, sigma) per doc type
_FILE_SIZE_PARAMS: dict[str, tuple[float, float]] = {
    "email": (3.0, 1.0),       # ~20 KB median
    "pdf": (5.5, 1.2),         # ~245 KB median
    "docx": (4.5, 1.0),        # ~90 KB median
    "xlsx": (5.0, 1.3),        # ~148 KB median
    "internal_memo": (3.8, 0.8),
    "financial_report": (6.0, 1.0),
    "contract": (5.8, 0.9),
}


class SyntheticDataGenerator:
    """Generates batches of synthetic document metadata records.

    Parameters
    ----------
    request:
        The user's generation request.
    profile:
        The scenario profile driving distributions and weights.
    """

    BATCH_SIZE: int = 500

    def __init__(self, request: GenerationRequest, profile: ScenarioProfile) -> None:
        self.request = request
        self.profile = profile

        # Deterministic seeding
        self.seed = request.seed if request.seed is not None else int(uuid.uuid4().int % (2**31))
        self.rng = np.random.default_rng(self.seed)
        self.fake = Faker()
        Faker.seed(self.seed)

        # Pre-compute scenario helpers
        self.case_id = self._generate_case_id()
        self.jurisdictions = get_jurisdictions(request.scenario.value)

        # Resolve document types and their weights from profile
        self._doc_types, self._doc_weights = self._resolve_doc_types()

        # Resolve custodian roles and weights
        self._cust_roles, self._cust_weights = self._resolve_custodian_roles()

        # Build a pool of fictional custodians
        self._custodian_pool = self._build_custodian_pool()

        # Parse date range
        self._start_date, self._end_date = self._parse_date_range()

        # Compute responsiveness rate
        self._responsive_rate = self._compute_responsive_rate()

        # Organization name (from profile or generated)
        self._org_name = self.profile.organizational_context.split(",")[0].strip() if self.profile.organizational_context else self.fake.company()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def generate_all(self) -> list[dict[str, Any]]:
        """Generate all records specified in the request, in batches."""
        total = self.request.num_records
        records: list[dict[str, Any]] = []
        generated = 0

        while generated < total:
            batch_size = min(self.BATCH_SIZE, total - generated)
            batch = self._generate_batch(batch_size, start_seq=generated)
            records.extend(batch)
            generated += batch_size
            logger.info("Generated %d / %d records", generated, total)

        return records

    # ------------------------------------------------------------------
    # Batch generation
    # ------------------------------------------------------------------

    def _generate_batch(self, size: int, start_seq: int) -> list[dict[str, Any]]:
        """Generate a batch of *size* records."""
        records: list[dict[str, Any]] = []

        # Pre-sample arrays for the batch
        doc_type_indices = self.rng.choice(len(self._doc_types), size=size, p=self._doc_weights)
        cust_indices = self.rng.choice(len(self._custodian_pool), size=size)
        responsive_flags = self.rng.random(size)
        privilege_rolls = self.rng.random(size)
        confidentiality_rolls = self.rng.random(size)
        date_offsets = self.rng.random(size)
        family_rolls = self.rng.random(size)
        attachment_rolls = self.rng.random(size)
        redaction_rolls = self.rng.random(size)
        legal_hold_rolls = self.rng.random(size)
        review_rolls = self.rng.random(size)

        for i in range(size):
            seq = start_seq + i
            doc_type = self._doc_types[doc_type_indices[i]]
            custodian = self._custodian_pool[cust_indices[i]]

            # --- Date ---
            date_created = self._sample_date(date_offsets[i])
            # date_modified is 0-90 days after creation, but not past end_date
            mod_delta = timedelta(days=int(self.rng.integers(0, 91)))
            date_modified = min(date_created + mod_delta, self._end_date)

            # --- Responsiveness (with conditional probabilities) ---
            resp_threshold = self._responsive_rate
            if doc_type == "email":
                resp_threshold = min(resp_threshold * 1.3, 0.95)
            elif doc_type == "financial_report":
                resp_threshold *= 0.8
            responsive = bool(responsive_flags[i] < resp_threshold)

            # --- Privilege (conditional on custodian role) ---
            priv_rate = self.profile.privilege_rate
            if custodian["role"] == "legal_counsel":
                priv_rate = min(priv_rate * 2.5, 0.90)
            elif custodian["role"] == "executive":
                priv_rate = min(priv_rate * 1.5, 0.80)

            if privilege_rolls[i] < priv_rate * 0.6:
                privilege_status = PrivilegeStatus.PRIVILEGED.value
            elif privilege_rolls[i] < priv_rate:
                privilege_status = PrivilegeStatus.PARTIALLY_PRIVILEGED.value
            else:
                privilege_status = PrivilegeStatus.NOT_PRIVILEGED.value

            # --- Confidentiality ---
            conf_dist = self.profile.confidentiality_distribution
            if doc_type == "financial_report":
                # Financial reports skew confidential
                conf_dist = {
                    "public": 0.02, "internal": 0.15,
                    "confidential": 0.50, "highly_confidential": 0.33,
                }
            confidentiality = self._sample_categorical(conf_dist, confidentiality_rolls[i])

            # --- Redaction ---
            redaction_base = 0.10
            if doc_type == "internal_memo":
                redaction_base = 0.35
            if privilege_status == PrivilegeStatus.PRIVILEGED.value:
                redaction_base = min(redaction_base + 0.25, 0.90)
            redaction_required = bool(redaction_rolls[i] < redaction_base)

            # --- Legal hold ---
            legal_hold_rate = 0.15 if responsive else 0.03
            legal_hold = bool(legal_hold_rolls[i] < legal_hold_rate)

            # --- Review status ---
            review_status = self._sample_review_status(review_rolls[i], responsive)

            # --- Document family ---
            family_id = None
            if family_rolls[i] < 0.25:
                # Assign to a family group
                family_group = int(self.rng.integers(0, max(1, self.request.num_records // 10)))
                family_id = f"FAM-{self.case_id}-{family_group:04d}"

            # --- Attachment count ---
            attachment_count = self._sample_attachment_count(attachment_rolls[i])

            # --- File size ---
            file_size_kb = self._sample_file_size(doc_type)

            # --- Communication channel ---
            comm_channel = None
            if doc_type == "email":
                comm_channel = _COMM_CHANNELS[int(self.rng.integers(0, len(_COMM_CHANNELS)))]

            # --- Issue tags ---
            issue_tags = self._sample_issue_tags(doc_type)

            # --- Jurisdiction ---
            jurisdiction = self.jurisdictions[int(self.rng.integers(0, len(self.jurisdictions)))]

            record: dict[str, Any] = {
                "document_id": f"DOC-{self.case_id}-{seq:06d}",
                "case_id": self.case_id,
                "document_type": doc_type,
                "custodian_id": custodian["id"],
                "custodian_role": custodian["role"],
                "fictional_custodian_name": custodian["name"],
                "fictional_organization": self._org_name,
                "date_created": date_created,
                "date_modified": date_modified,
                "file_type": _FILE_TYPE_MAP.get(doc_type, ".pdf"),
                "communication_channel": comm_channel,
                "confidentiality_level": confidentiality,
                "privilege_status": privilege_status,
                "responsive": responsive,
                "issue_tags": issue_tags,
                "legal_hold": legal_hold,
                "review_status": review_status,
                "redaction_required": redaction_required,
                "document_family_id": family_id,
                "attachment_count": attachment_count,
                "file_size_kb": round(file_size_kb, 2),
                "language": "en",
                "jurisdiction": jurisdiction,
            }
            records.append(record)

        return records

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _generate_case_id(self) -> str:
        """Generate a deterministic case ID from the seed and scenario."""
        raw = f"{self.request.scenario.value}-{self.seed}"
        h = hashlib.sha256(raw.encode()).hexdigest()[:8].upper()
        return f"CASE-{h}"

    def _resolve_doc_types(self) -> tuple[list[str], np.ndarray]:
        """Return selected document types and their normalised weights."""
        requested = set(self.request.document_types)
        profile_weights = self.profile.suggested_document_types

        types: list[str] = []
        weights: list[float] = []
        for dt in requested:
            types.append(dt)
            weights.append(profile_weights.get(dt, 0.1))

        if not types:
            types = list(profile_weights.keys())
            weights = list(profile_weights.values())

        arr = np.array(weights, dtype=np.float64)
        arr /= arr.sum()
        return types, arr

    def _resolve_custodian_roles(self) -> tuple[list[str], np.ndarray]:
        """Return custodian roles and their normalised weights."""
        roles = list(self.profile.custodian_roles.keys())
        weights = np.array(list(self.profile.custodian_roles.values()), dtype=np.float64)
        weights /= weights.sum()
        return roles, weights

    def _build_custodian_pool(self, pool_size: int = 30) -> list[dict[str, str]]:
        """Create a pool of fictional custodians."""
        pool: list[dict[str, str]] = []
        role_indices = self.rng.choice(len(self._cust_roles), size=pool_size, p=self._cust_weights)

        for idx, ri in enumerate(role_indices):
            role = self._cust_roles[ri]
            name = self.fake.name()
            cust_id = f"CUST-{idx + 1:03d}"
            pool.append({"id": cust_id, "name": name, "role": role})
        return pool

    def _parse_date_range(self) -> tuple[datetime, datetime]:
        """Parse the typical date range from the scenario profile."""
        start_str = self.profile.typical_date_range.get("start", "2021-01-01")
        end_str = self.profile.typical_date_range.get("end", "2024-06-30")
        start = datetime.strptime(start_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        end = datetime.strptime(end_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        return start, end

    def _compute_responsive_rate(self) -> float:
        """Determine the target responsiveness rate from request config."""
        dist = self.request.classification_distribution
        if dist == ClassificationDistribution.BALANCED:
            return 0.50
        elif dist == ClassificationDistribution.CUSTOM:
            return self.request.custom_responsive_pct if self.request.custom_responsive_pct is not None else 0.35
        else:
            # Realistic — use the profile's rate.
            return self.profile.responsiveness_rate

    def _sample_date(self, uniform_roll: float) -> datetime:
        """Sample a date from the scenario's date range."""
        total_seconds = (self._end_date - self._start_date).total_seconds()
        offset = timedelta(seconds=uniform_roll * total_seconds)
        return self._start_date + offset

    @staticmethod
    def _sample_categorical(distribution: dict[str, float], roll: float) -> str:
        """Pick a category from a weighted distribution using a uniform roll."""
        cumulative = 0.0
        for key, weight in distribution.items():
            cumulative += weight
            if roll < cumulative:
                return key
        # Fallback to last key
        return list(distribution.keys())[-1]

    def _sample_review_status(self, roll: float, responsive: bool) -> str:
        """Sample a review status weighted by responsiveness."""
        if responsive:
            # Responsive docs more likely to have been reviewed
            if roll < 0.30:
                return ReviewStatus.REVIEWED.value
            elif roll < 0.55:
                return ReviewStatus.PENDING.value
            elif roll < 0.80:
                return ReviewStatus.NEEDS_SECOND_REVIEW.value
            else:
                return ReviewStatus.ESCALATED.value
        else:
            if roll < 0.60:
                return ReviewStatus.PENDING.value
            elif roll < 0.85:
                return ReviewStatus.REVIEWED.value
            elif roll < 0.95:
                return ReviewStatus.NEEDS_SECOND_REVIEW.value
            else:
                return ReviewStatus.ESCALATED.value

    def _sample_attachment_count(self, roll: float) -> int:
        """Most documents have 0 attachments; some 1-5; rare 6+."""
        if roll < 0.60:
            return 0
        elif roll < 0.85:
            return int(self.rng.integers(1, 4))
        elif roll < 0.95:
            return int(self.rng.integers(4, 6))
        else:
            return int(self.rng.integers(6, 12))

    def _sample_file_size(self, doc_type: str) -> float:
        """Sample file size from a log-normal distribution, in KB."""
        mu, sigma = _FILE_SIZE_PARAMS.get(doc_type, (4.5, 1.0))
        size = float(self.rng.lognormal(mu, sigma))
        return max(1.0, min(size, 500_000.0))  # Clamp to 1 KB – 500 MB

    def _sample_issue_tags(self, doc_type: str) -> list[str]:
        """Sample 1-4 issue tags from the scenario's suggested tags."""
        tags = self.profile.suggested_issue_tags
        if not tags:
            return ["general"]

        n_tags = int(self.rng.integers(1, min(5, len(tags) + 1)))
        chosen_indices = self.rng.choice(len(tags), size=n_tags, replace=False)
        return [tags[i] for i in chosen_indices]
