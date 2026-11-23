from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.services.export_service import ExportService

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/{dataset_id}/csv")
def export_csv(dataset_id: str):
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

@router.get("/{dataset_id}/json")
def export_json(dataset_id: str):
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
