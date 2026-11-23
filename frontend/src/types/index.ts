export interface DateRange {
  start: string;
  end: string;
}

export interface GenerationConfig {
  scenario_type: string;
  custom_scenario_details?: string;
  size: number;
  complexity: 'Low' | 'Medium' | 'High';
  date_range: DateRange;
  document_categories: string[];
  custodian_count: number;
  target_privilege_ratio: number;
  target_responsiveness_ratio: number;
  confidentiality_levels: string[];
  additional_instructions?: string;
}

export interface NLScenarioResponse {
  inferred_config: GenerationConfig;
  suggested_name: string;
  scenario_summary: string;
  key_entities: string[];
  inferred_issues: string[];
}

export interface DocumentMetadata {
  doc_id: string;
  filename: string;
  title: string;
  doc_type: string;
  file_extension: string;
  file_size_kb: number;
  creation_date: string;
  modified_date: string;
  custodian: string;
  sender?: string;
  recipients: string[];
  source_system: string;
  confidentiality_level: string;
  privilege_status: 'Not Privileged' | 'Attorney-Client' | 'Work Product' | 'Joint Defense';
  privilege_basis?: string | null;
  responsiveness: 'Responsive' | 'Non-Responsive';
  issue_tags: string[];
  litigation_scenario: string;
  synthetic_marker: string;
}

export interface ValidationStatus {
  is_valid: boolean;
  checked_records: number;
  error_count: number;
  warnings: string[];
}

export interface ModelInfo {
  provider: string;
  model_name: string;
  batches_generated: number;
  total_duration_sec: number;
}

export interface DatasetSummary {
  dataset_id: string;
  name: string;
  scenario_type: string;
  document_count: number;
  created_at: string;
  validation_status: ValidationStatus;
}

export interface DatasetDetail {
  dataset_id: string;
  name: string;
  scenario_type: string;
  description?: string;
  parameters: GenerationConfig;
  document_count: number;
  records: DocumentMetadata[];
  validation_status: ValidationStatus;
  model_info: ModelInfo;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsOverview {
  total_datasets: number;
  total_documents: number;
  scenarios_count: number;
  privileged_count: number;
  non_privileged_count: number;
  responsive_count: number;
  non_responsive_count: number;
  scenario_distribution: { name: string; value: number }[];
  category_distribution: { name: string; value: number }[];
  privilege_distribution: { name: string; value: number }[];
  responsiveness_distribution: { name: string; value: number }[];
  recent_datasets: DatasetSummary[];
}

export interface DatasetAnalytics {
  dataset_id: string;
  total_documents: number;
  category_distribution: { name: string; count: number }[];
  custodian_distribution: { name: string; count: number }[];
  privilege_distribution: { name: string; value: number }[];
  responsiveness_distribution: { name: string; value: number }[];
  confidentiality_distribution: { name: string; count: number }[];
  year_distribution: { year: string; count: number }[];
  top_tags: { tag: string; count: number }[];
}

export interface HealthStatus {
  status: string;
  environment: string;
  database: {
    status: string;
    name: string;
    type?: string;
    total_datasets?: number;
    total_documents?: number;
    last_generation?: string;
  };
  generative_ai: {
    provider: string;
    model: string;
    configured: boolean;
    status?: string;
    note: string;
  };
}
