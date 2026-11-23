from typing import Dict, Any, List
from collections import Counter
from app.database import get_database
from app.schemas.dataset import AnalyticsOverview, DatasetSummary, ValidationStatus

class AnalyticsService:
    @staticmethod
    def get_overview_analytics() -> AnalyticsOverview:
        db = get_database()
        cursor = db.datasets.find({}, {
            "dataset_id": 1,
            "name": 1,
            "scenario_type": 1,
            "document_count": 1,
            "created_at": 1,
            "validation_status": 1,
            "records.doc_type": 1,
            "records.privilege_status": 1,
            "records.responsiveness": 1,
            "records.creation_date": 1
        }).sort("created_at", -1)

        datasets_raw = list(cursor)
        total_datasets = len(datasets_raw)

        total_docs = 0
        scenario_counts = Counter()
        category_counts = Counter()
        privilege_counts = Counter()
        resp_counts = Counter()

        recent_datasets: List[DatasetSummary] = []

        for ds in datasets_raw:
            scenario = ds.get("scenario_type", "Unknown")
            scenario_counts[scenario] += 1
            doc_cnt = ds.get("document_count", 0)
            total_docs += doc_cnt

            if len(recent_datasets) < 5:
                v_status = ds.get("validation_status", {})
                recent_datasets.append(DatasetSummary(
                    dataset_id=ds.get("dataset_id"),
                    name=ds.get("name"),
                    scenario_type=scenario,
                    document_count=doc_cnt,
                    created_at=str(ds.get("created_at")),
                    validation_status=ValidationStatus(**v_status) if v_status else ValidationStatus()
                ))

            for rec in ds.get("records", []):
                cat = rec.get("doc_type", "Other")
                category_counts[cat] += 1

                priv = rec.get("privilege_status", "Not Privileged")
                privilege_counts[priv] += 1

                resp = rec.get("responsiveness", "Responsive")
                resp_counts[resp] += 1

        priv_count = sum(v for k, v in privilege_counts.items() if k != "Not Privileged")
        non_priv_count = privilege_counts.get("Not Privileged", 0)

        responsive_count = resp_counts.get("Responsive", 0)
        non_responsive_count = resp_counts.get("Non-Responsive", 0)

        return AnalyticsOverview(
            total_datasets=total_datasets,
            total_documents=total_docs,
            scenarios_count=len(scenario_counts),
            privileged_count=priv_count,
            non_privileged_count=non_priv_count,
            responsive_count=responsive_count,
            non_responsive_count=non_responsive_count,
            scenario_distribution=[{"name": k, "value": v} for k, v in scenario_counts.most_common()],
            category_distribution=[{"name": k, "value": v} for k, v in category_counts.most_common()],
            privilege_distribution=[{"name": k, "value": v} for k, v in privilege_counts.items()],
            responsiveness_distribution=[{"name": k, "value": v} for k, v in resp_counts.items()],
            recent_datasets=recent_datasets
        )

    @staticmethod
    def get_dataset_analytics(dataset_id: str) -> Dict[str, Any]:
        db = get_database()
        ds = db.datasets.find_one({"dataset_id": dataset_id})
        if not ds:
            return {}

        records = ds.get("records", [])
        cat_counts = Counter()
        custodian_counts = Counter()
        priv_counts = Counter()
        resp_counts = Counter()
        conf_counts = Counter()
        year_counts = Counter()
        tag_counts = Counter()

        for r in records:
            cat_counts[r.get("doc_type", "Other")] += 1
            custodian_counts[r.get("custodian", "Unknown")] += 1
            priv_counts[r.get("privilege_status", "Not Privileged")] += 1
            resp_counts[r.get("responsiveness", "Responsive")] += 1
            conf_counts[r.get("confidentiality_level", "Confidential")] += 1

            c_date = r.get("creation_date", "")
            year = c_date[:4] if len(c_date) >= 4 else "Unknown"
            year_counts[year] += 1

            for tag in r.get("issue_tags", []):
                tag_counts[tag] += 1

        return {
            "dataset_id": dataset_id,
            "total_documents": len(records),
            "category_distribution": [{"name": k, "count": v} for k, v in cat_counts.most_common()],
            "custodian_distribution": [{"name": k, "count": v} for k, v in custodian_counts.most_common(8)],
            "privilege_distribution": [{"name": k, "value": v} for k, v in priv_counts.items()],
            "responsiveness_distribution": [{"name": k, "value": v} for k, v in resp_counts.items()],
            "confidentiality_distribution": [{"name": k, "count": v} for k, v in conf_counts.items()],
            "year_distribution": sorted([{"year": k, "count": v} for k, v in year_counts.items()], key=lambda x: x["year"]),
            "top_tags": [{"tag": k, "count": v} for k, v in tag_counts.most_common(8)]
        }
