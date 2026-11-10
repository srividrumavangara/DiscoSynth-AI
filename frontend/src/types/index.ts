export interface Dataset {
  id: string;
  name: string;
  scenario: string;
  num_records: number;
  complexity: string;
  generation_method: string;
  status: string;
  quality_score: number | null;
  seed: number | null;
  config_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DocumentMetadata {
  id: number;
  dataset_id: string;
  document_id: string;
  case_id: string;
  document_type: string;
  custodian_id: string;
  custodian_role: string;
  fictional_custodian_name: string;
  fictional_organization: string;
  date_created: string;
  date_modified: string;
  file_type: string;
  communication_channel: string | null;
  confidentiality_level: string;
  privilege_status: string;
  responsive: boolean;
  issue_tags: string[];
  legal_hold: boolean;
  review_status: string;
  redaction_required: boolean;
  document_family_id: string | null;
  attachment_count: number;
  file_size_kb: number;
  language: string;
  jurisdiction: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AnalyticsData {
  document_type_distribution: Record<string, number>;
  responsive_distribution: Record<string, number>;
  privilege_distribution: Record<string, number>;
  confidentiality_distribution: Record<string, number>;
  timeline: Array<{ date: string; count: number }>;
  issue_tag_frequency: Record<string, number>;
  review_status_distribution: Record<string, number>;
  metadata_completeness: number;
}

export interface QualityReport {
  overall_score: number;
  schema_validity: number;
  completeness: number;
  uniqueness: number;
  logical_consistency: number;
  distribution_adherence: number;
  details: Record<string, unknown>;
}

export interface GenerationRequest {
  name: string;
  scenario: string;
  num_records: number;
  complexity: string;
  document_types: string[];
  classification_distribution: string;
  custom_responsive_pct?: number;
  custom_privileged_pct?: number;
  seed?: number | null;
  generation_method: string;
}

export interface HealthStatus {
  status: string;
  database: string;
  llm_provider: string;
  llm_status: string;
  version: string;
}
