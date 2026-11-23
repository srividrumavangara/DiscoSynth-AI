from fastapi import APIRouter, HTTPException
from app.schemas.generation import NLScenarioRequest, NLScenarioResponse
from app.services.prompt_service import PromptService
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/scenario", tags=["Scenario Interpretation"])

@router.post("/interpret", response_model=NLScenarioResponse)
def interpret_scenario(req: NLScenarioRequest):
    if not gemini_service.is_configured():
        raise HTTPException(
            status_code=400,
            detail="Gemini API is not configured. Please supply GEMINI_API_KEY in backend/.env"
        )

    try:
        prompt = PromptService.build_scenario_interpretation_prompt(req.prompt)
        sys_prompt = PromptService.get_system_prompt()
        interpreted = gemini_service.generate_json(prompt, system_instruction=sys_prompt)

        return NLScenarioResponse(
            inferred_config=interpreted.get("inferred_config"),
            suggested_name=interpreted.get("suggested_name", "Synthetic Litigation Dataset"),
            scenario_summary=interpreted.get("scenario_summary", req.prompt),
            key_entities=interpreted.get("key_entities", []),
            inferred_issues=interpreted.get("inferred_issues", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to interpret scenario: {str(e)}")
