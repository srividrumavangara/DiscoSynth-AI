from fastapi import APIRouter, HTTPException, Query, Response, Depends
from typing import List, Optional
from app.database import get_database
from app.schemas.dataset import DatasetSummary, DatasetDetail, ValidationStatus
from app.schemas.metadata_record import DocumentMetadataUpdate
from app.schemas.user import UserProfile
from app.services.export_service import ExportService
from app.auth import get_optional_user
from datetime import datetime, timezone

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.get("", response_model=List[DatasetSummary])
def list_datasets(
    scenario: Optional[str] = Query(None, description="Filter by litigation scenario"),
    limit: int = Query(50, ge=1, le=100),
    current_user: Optional[UserProfile] = Depends(get_optional_user)
):
    db = get_database()
    query = {}
    if scenario and scenario != "All":
        query["scenario_type"] = scenario

    if current_user:
        query["$or"] = [
            {"user_id": current_user.user_id},
            {"user_id": None},
            {"user_id": {"$exists": False}}
        ]

    cursor = db.datasets.find(query, {
        "dataset_id": 1,
        "name": 1,
        "scenario_type": 1,
        "document_count": 1,
        "created_at": 1,
        "validation_status": 1,
        "user_id": 1
    }).sort("created_at", -1).limit(limit)

    results = []
    for doc in cursor:
        v_status = doc.get("validation_status", {})
        results.append(DatasetSummary(
            dataset_id=doc.get("dataset_id"),
            name=doc.get("name", "Untitled Dataset"),
            scenario_type=doc.get("scenario_type", "General"),
            document_count=doc.get("document_count", 0),
            created_at=str(doc.get("created_at")),
            validation_status=ValidationStatus(**v_status) if v_status else ValidationStatus(),
            user_id=doc.get("user_id")
        ))
    return results

@router.get("/{dataset_id}", response_model=DatasetDetail)
def get_dataset(dataset_id: str):
    db = get_database()
    doc = db.datasets.find_one({"dataset_id": dataset_id})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found.")
    if "_id" in doc:
        del doc["_id"]
    return doc

@router.patch("/{dataset_id}/records/{doc_id}")
def update_dataset_record(dataset_id: str, doc_id: str, update_data: DocumentMetadataUpdate):
    db = get_database()
    ds = db.datasets.find_one({"dataset_id": dataset_id})
    if not ds:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found.")

    records = ds.get("records", [])
    found = False
    now_iso = datetime.now(timezone.utc).isoformat()

    update_fields = update_data.model_dump(exclude_unset=True)

    for r in records:
        if r.get("doc_id") == doc_id:
            for k, v in update_fields.items():
                r[k] = v
            r["modified_date"] = now_iso
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail=f"Record {doc_id} not found in dataset {dataset_id}.")

    db.datasets.update_one(
        {"dataset_id": dataset_id},
        {"$set": {"records": records, "updated_at": now_iso}}
    )

    return {"status": "success", "message": f"Record {doc_id} updated successfully."}

@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: str):
    db = get_database()
    res = db.datasets.delete_one({"dataset_id": dataset_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found.")
    return {"status": "success", "message": f"Dataset {dataset_id} deleted successfully."}

@router.get("/{dataset_id}/export/csv")
def export_dataset_csv(dataset_id: str):
    try:
        csv_buffer = ExportService.export_to_csv(dataset_id)
        filename = f"{dataset_id}_litigation_metadata.csv"
        return Response(
            content=csv_buffer.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.get("/{dataset_id}/export/json")
def export_dataset_json(dataset_id: str):
    try:
        json_data = ExportService.export_to_json(dataset_id)
        filename = f"{dataset_id}_litigation_metadata.json"
        return Response(
            content=json_data,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
