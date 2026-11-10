"""Analytics computation service for DiscoSynth AI.

Queries the database to build chart-ready analytics for a given dataset.
"""

from __future__ import annotations

import logging
from collections import Counter, defaultdict

from sqlalchemy.orm import Session

from app.models import DocumentMetadata
from app.schemas import AnalyticsResponse, TimelinePoint

logger = logging.getLogger(__name__)

# Fields considered "required" for completeness calculation
_ALL_FIELDS = [
    "document_id", "case_id", "document_type", "custodian_id",
    "custodian_role", "fictional_custodian_name", "fictional_organization",
    "date_created", "date_modified", "file_type", "confidentiality_level",
    "privilege_status", "review_status", "jurisdiction", "file_size_kb",
    "language", "issue_tags",
]


def compute_analytics(dataset_id: str, db: Session) -> AnalyticsResponse:
    """Compute analytics from stored records for *dataset_id*.

    Parameters
    ----------
    dataset_id:
        UUID of the dataset.
    db:
        Active database session.
    """
    records = (
        db.query(DocumentMetadata)
        .filter(DocumentMetadata.dataset_id == dataset_id)
        .all()
    )

    total = len(records)
    if total == 0:
        return AnalyticsResponse(
            dataset_id=dataset_id,
            total_records=0,
            document_type_distribution={},
            responsive_distribution={"responsive": 0, "non_responsive": 0},
            privilege_distribution={},
            confidentiality_distribution={},
            timeline=[],
            issue_tag_frequency={},
            review_status_distribution={},
            metadata_completeness=0.0,
        )

    # Document type distribution
    doc_type_counter: Counter[str] = Counter()
    for rec in records:
        doc_type_counter[rec.document_type] += 1

    # Responsive distribution
    resp_count = sum(1 for r in records if r.responsive)
    responsive_dist = {
        "responsive": resp_count,
        "non_responsive": total - resp_count,
    }

    # Privilege distribution
    priv_counter: Counter[str] = Counter()
    for rec in records:
        priv_counter[rec.privilege_status] += 1

    # Confidentiality distribution
    conf_counter: Counter[str] = Counter()
    for rec in records:
        conf_counter[rec.confidentiality_level] += 1

    # Timeline — group by year-month
    monthly: defaultdict[str, int] = defaultdict(int)
    for rec in records:
        if rec.date_created:
            key = rec.date_created.strftime("%Y-%m")
            monthly[key] += 1
    timeline = [
        TimelinePoint(date=k, count=v)
        for k, v in sorted(monthly.items())
    ]

    # Issue tag frequency
    tag_counter: Counter[str] = Counter()
    for rec in records:
        tags = rec.issue_tags if rec.issue_tags else []
        for tag in tags:
            tag_counter[tag] += 1

    # Review status distribution
    review_counter: Counter[str] = Counter()
    for rec in records:
        review_counter[rec.review_status] += 1

    # Metadata completeness
    total_fields = total * len(_ALL_FIELDS)
    filled = 0
    for rec in records:
        for field in _ALL_FIELDS:
            val = getattr(rec, field, None)
            if val is not None and val != "" and val != []:
                filled += 1
    completeness = round(filled / total_fields, 4) if total_fields > 0 else 0.0

    return AnalyticsResponse(
        dataset_id=dataset_id,
        total_records=total,
        document_type_distribution=dict(doc_type_counter),
        responsive_distribution=responsive_dist,
        privilege_distribution=dict(priv_counter),
        confidentiality_distribution=dict(conf_counter),
        timeline=timeline,
        issue_tag_frequency=dict(tag_counter.most_common()),
        review_status_distribution=dict(review_counter),
        metadata_completeness=completeness,
    )
