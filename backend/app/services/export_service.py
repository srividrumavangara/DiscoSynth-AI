import io
import json
import pandas as pd
from typing import List, Dict, Any
from app.database import get_database

class ExportService:
    @staticmethod
    def get_dataset_records(dataset_id: str) -> List[Dict[str, Any]]:
        db = get_database()
        ds = db.datasets.find_one({"dataset_id": dataset_id})
        if not ds:
            raise ValueError(f"Dataset {dataset_id} not found.")
        return ds.get("records", [])

    @classmethod
    def export_to_csv(cls, dataset_id: str) -> io.StringIO:
        records = cls.get_dataset_records(dataset_id)
        if not records:
            df = pd.DataFrame()
        else:
            # Flatten lists like recipients and issue_tags into semicolon-separated strings for CSV
            formatted = []
            for r in records:
                row = dict(r)
                if isinstance(row.get("recipients"), list):
                    row["recipients"] = "; ".join(row["recipients"])
                if isinstance(row.get("issue_tags"), list):
                    row["issue_tags"] = "; ".join(row["issue_tags"])
                formatted.append(row)
            df = pd.DataFrame(formatted)

        output = io.StringIO()
        df.to_csv(output, index=False, encoding="utf-8")
        output.seek(0)
        return output

    @classmethod
    def export_to_json(cls, dataset_id: str) -> str:
        db = get_database()
        ds = db.datasets.find_one({"dataset_id": dataset_id})
        if not ds:
            raise ValueError(f"Dataset {dataset_id} not found.")
        if "_id" in ds:
            ds["_id"] = str(ds["_id"])
        return json.dumps(ds, indent=2, default=str)
