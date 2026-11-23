from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.schemas.generation import GenerationConfig
from app.schemas.metadata_record import DocumentMetadata

class ValidationStatus(BaseModel):
    is_valid: bool = True
    checked_records: int = 0
    error_count: int = 0
    warnings: List[str] = Field(default_factory=list)

class ModelInfo(BaseModel):
    provider: str = "Google Gemini"
    model_name: str = "gemini-2.5-flash"
    batches_generated: int = 1
    total_duration_sec: float = 0.0

class DatasetSummary(BaseModel):
    dataset_id: str
    name: str
    scenario_type: str
    document_count: int
    created_at: str
    validation_status: ValidationStatus

class DatasetDetail(BaseModel):
    dataset_id: str
    name: str
    scenario_type: str
    description: Optional[str] = None
    parameters: GenerationConfig
    document_count: int
    records: List[DocumentMetadata]
    validation_status: ValidationStatus
    model_info: ModelInfo
    created_at: str
    updated_at: str

class AnalyticsOverview(BaseModel):
    total_datasets: int
    total_documents: int
    scenarios_count: int
    privileged_count: int
    non_privileged_count: int
    responsive_count: int
    non_responsive_count: int
    scenario_distribution: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]
    privilege_distribution: List[Dict[str, Any]]
    responsiveness_distribution: List[Dict[str, Any]]
    recent_datasets: List[DatasetSummary]
