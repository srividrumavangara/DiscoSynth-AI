from fastapi import APIRouter
from app.database import check_db_health, get_database
from app.services.gemini_service import gemini_service
from app.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health_check():
    db_ok = check_db_health()
    llm_configured = gemini_service.is_configured()

    total_datasets = 0
    total_docs = 0
    last_generation = None
    db_type = "MongoDB Atlas" if "mongodb+srv" in settings.MONGODB_URI else "Local MongoDB"

    if db_ok:
        try:
            db = get_database()
            total_datasets = db.datasets.count_documents({})
            recent = db.datasets.find().sort("created_at", -1).limit(1)
            for r in recent:
                last_generation = r.get("created_at")
            
            # Aggregated docs count
            pipeline = [{"$group": {"_id": None, "total": {"$sum": "$document_count"}}}]
            agg = list(db.datasets.aggregate(pipeline))
            if agg:
                total_docs = agg[0].get("total", 0)
        except Exception:
            pass

    status = "healthy" if db_ok and llm_configured else "degraded"
    return {
        "status": status,
        "environment": settings.ENVIRONMENT,
        "database": {
            "status": "connected" if db_ok else "unreachable",
            "name": settings.DATABASE_NAME,
            "type": db_type,
            "total_datasets": total_datasets,
            "total_documents": total_docs,
            "last_generation": last_generation
        },
        "generative_ai": {
            "provider": "Google Gemini",
            "model": gemini_service.active_model,
            "configured": llm_configured,
            "status": "connected" if llm_configured else "disconnected",
            "note": f"Ready with {gemini_service.active_model}" if llm_configured else "GEMINI_API_KEY missing in backend/.env"
        }
    }
