import pytest
from app.services.prompt_service import PromptService
from app.schemas.generation import GenerationConfig, DateRange

def test_prompt_service_system_prompt():
    prompt = PromptService.get_system_prompt()
    assert "e-discovery" in prompt
    assert "synthetic litigation" in prompt
    assert "strictly valid JSON" in prompt

def test_prompt_service_interpretation_prompt():
    user_query = "Generate an employment litigation dataset involving 20 documents and 4 custodians."
    prompt = PromptService.build_scenario_interpretation_prompt(user_query)
    assert user_query in prompt
    assert "inferred_config" in prompt
    assert "suggested_name" in prompt

def test_prompt_service_batch_prompt():
    config = GenerationConfig(
        scenario_type="Corporate Fraud",
        size=25,
        complexity="High",
        date_range=DateRange(start="2022-01-01", end="2024-12-31")
    )
    ctx = {
        "entities": ["Apex Corp", "Meridian Global"],
        "custodians": ["Arthur Vance (CFO)"],
        "case_title": "In re Meridian Global"
    }
    prompt = PromptService.build_metadata_batch_prompt(
        config=config,
        batch_index=0,
        batch_size=25,
        start_id_number=1,
        dataset_prefix="DS-TEST",
        fictional_context=ctx
    )
    assert "DS-TEST-0001" in prompt
    assert "Meridian Global" in prompt
    assert "Corporate Fraud" in prompt
