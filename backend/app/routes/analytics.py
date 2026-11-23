from fastapi import APIRouter, HTTPException
from app.services.analytics_service import AnalyticsService
from app.schemas.dataset import AnalyticsOverview

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview():
    try:
        return AnalyticsService.get_overview_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch overview analytics: {str(e)}")

@router.get("/{dataset_id}")
def get_dataset_analytics(dataset_id: str):
    data = AnalyticsService.get_dataset_analytics(dataset_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found.")
    return data
