from pydantic import BaseModel, Field
from typing import List, Optional

class DateRange(BaseModel):
    start: str = Field(default="2022-01-01", description="Start date (YYYY-MM-DD)")
    end: str = Field(default="2024-12-31", description="End date (YYYY-MM-DD)")

class GenerationConfig(BaseModel):
    scenario_type: str = Field(
        default="Corporate Fraud",
        description="Litigation scenario (e.g. Corporate Fraud, Intellectual Property Dispute, Employment Litigation, Contract Dispute, Financial Misconduct, Regulatory Investigation, Custom Scenario)"
    )
    custom_scenario_details: Optional[str] = Field(None, description="Details if custom scenario is selected")
    size: int = Field(default=25, ge=5, le=200, description="Number of synthetic documents to generate")
    complexity: str = Field(default="Medium", description="Low, Medium, or High complexity")
    date_range: DateRange = Field(default_factory=DateRange)
    document_categories: List[str] = Field(
        default_factory=lambda: ["Emails", "Contracts", "Financial Records", "Internal Communications"]
    )
    custodian_count: int = Field(default=4, ge=1, le=20, description="Number of distinct custodians/owners")
    target_privilege_ratio: float = Field(default=0.20, ge=0.0, le=1.0, description="Approx target privilege ratio")
    target_responsiveness_ratio: float = Field(default=0.65, ge=0.0, le=1.0, description="Approx target responsiveness ratio")
    confidentiality_levels: List[str] = Field(
        default_factory=lambda: ["Public", "Confidential", "Highly Confidential - Attorneys' Eyes Only"]
    )
    additional_instructions: Optional[str] = Field(None, description="Custom prompt directions or specific issues to simulate")

class NLScenarioRequest(BaseModel):
    prompt: str = Field(..., min_length=5, description="Natural language prompt describing litigation scenario")

class NLScenarioResponse(BaseModel):
    inferred_config: GenerationConfig
    suggested_name: str
    scenario_summary: str
    key_entities: List[str]
    inferred_issues: List[str]
