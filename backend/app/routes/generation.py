from fastapi import APIRouter, HTTPException
from app.schemas.generation import GenerationConfig
from app.schemas.dataset import DatasetDetail
from app.services.generation_service import GenerationService
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/generation", tags=["Generation"])

@router.post("/generate", response_model=DatasetDetail)
def generate_dataset(config: GenerationConfig):
    if not gemini_service.is_configured():
        raise HTTPException(
            status_code=400,
            detail="Gemini API key is not configured. Please add GEMINI_API_KEY to your backend/.env configuration."
        )

    try:
        dataset = GenerationService.generate_dataset(config)
        return dataset
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dataset generation failed: {str(e)}")
