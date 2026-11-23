import json
from typing import Dict, Any, List
from app.schemas.generation import GenerationConfig

class PromptService:
    @staticmethod
    def get_system_prompt() -> str:
        return (
            "You are an expert e-discovery legal technologist, senior litigation paralegal, and data scientist. "
            "Your task is to generate realistic, logically consistent, and structured synthetic litigation document metadata "
            "for testing and benchmarking e-discovery machine learning and NLP classification models. "
            "CRITICAL RULES:\n"
            "1. Generate ONLY fictional data. Do NOT use real living persons or real confidential case names.\n"
            "2. Output strictly valid JSON conforming to the requested schema.\n"
            "3. Ensure temporal, relational, and contextual consistency across all metadata fields.\n"
            "4. Never output placeholders or truncation."
        )

    @staticmethod
    def build_scenario_interpretation_prompt(user_query: str) -> str:
        return f"""
Analyze the following natural-language request describing a litigation scenario for e-discovery testing:
\"{user_query}\"

Extract and infer the parameters for generating a synthetic litigation dataset.
Return a single JSON object with the following schema:
{{
  "inferred_config": {{
    "scenario_type": "Corporate Fraud | Intellectual Property Dispute | Employment Litigation | Contract Dispute | Financial Misconduct | Regulatory Investigation | Custom Scenario",
    "custom_scenario_details": "string or null",
    "size": integer (between 5 and 100, default 25 if unspecified),
    "complexity": "Low | Medium | High",
    "date_range": {{
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD"
    }},
    "document_categories": ["Emails", "Contracts", "Financial Records", "Court Filings", "Internal Communications", "Reports", "Evidence Records"],
    "custodian_count": integer (between 2 and 10),
    "target_privilege_ratio": float (between 0.05 and 0.40, e.g. 0.20),
    "target_responsiveness_ratio": float (between 0.30 and 0.85, e.g. 0.65),
    "confidentiality_levels": ["Public", "Confidential", "Highly Confidential - Attorneys' Eyes Only"],
    "additional_instructions": "string describing key issues, entities, and context"
  }},
  "suggested_name": "Concise descriptive title for this synthetic litigation dataset",
  "scenario_summary": "2-3 sentences explaining the factual background of the fictional dispute",
  "key_entities": ["List of 3-5 fictional corporate entities, regulators, or parties"],
  "inferred_issues": ["List of 3-5 core legal/factual issues, e.g. 'Revenue Recognition', 'Patent Infringement Claim'"]
}}
"""

    @staticmethod
    def build_metadata_batch_prompt(
        config: GenerationConfig,
        batch_index: int,
        batch_size: int,
        start_id_number: int,
        dataset_prefix: str,
        fictional_context: Dict[str, Any]
    ) -> str:
        custodians_str = json.dumps(fictional_context.get("custodians", []))
        entities_str = json.dumps(fictional_context.get("entities", []))
        case_title = fictional_context.get("case_title", config.scenario_type)

        return f"""
Generate a batch of exactly {batch_size} realistic synthetic litigation metadata records for e-discovery evaluation.

LITIGATION CONTEXT:
- Case / Dispute: {case_title}
- Scenario Type: {config.scenario_type}
- Complexity Level: {config.complexity}
- Date Range Boundary: {config.date_range.start} to {config.date_range.end}
- Allowed Document Categories: {json.dumps(config.document_categories)}
- Key Entities: {entities_str}
- Core Custodians: {custodians_str}
- Target Privilege Ratio: ~{int(config.target_privilege_ratio * 100)}%
- Target Responsiveness Ratio: ~{int(config.target_responsiveness_ratio * 100)}%
- Additional Guidelines: {config.additional_instructions or "Ensure authentic e-discovery metadata properties"}

BATCH SPECIFICS:
- Batch Number: {batch_index + 1}
- Records to generate in this batch: {batch_size}
- Starting Document Number: {start_id_number}
- ID Format: {dataset_prefix}-{start_id_number:04d} up to {dataset_prefix}-{(start_id_number + batch_size - 1):04d}

RECORD FIELD REQUIREMENTS:
1. doc_id: Must match the sequential ID format above.
2. filename: Plausible filename with realistic extension (.msg, .eml, .pdf, .xlsx, .docx, .pptx).
3. title: Realistic email subject or document title.
4. doc_type: Must be one of the Allowed Document Categories.
5. file_extension: Extension without dot (e.g. msg, pdf, xlsx).
6. file_size_kb: Integer size between 12 and 45000.
7. creation_date: ISO 8601 date string strictly between {config.date_range.start} and {config.date_range.end}.
8. modified_date: ISO 8601 date string on or after creation_date.
9. custodian: One of the Core Custodians.
10. sender: For emails/internal comms, realistic sender email matching the custodian/party domain. For static files, author name.
11. recipients: List of recipient email addresses or names.
12. source_system: E.g., 'Microsoft Exchange Online', 'Workday Cloud', 'Google Drive Workspace', 'Enterprise File Share', 'SAP S/4HANA'.
13. confidentiality_level: One of {json.dumps(config.confidentiality_levels)}.
14. privilege_status: One of 'Not Privileged', 'Attorney-Client', 'Work Product', 'Joint Defense'.
15. privilege_basis: If privilege_status is NOT 'Not Privileged', provide a realistic legal rationale (e.g. 'Communications seeking legal advice regarding compliance audit findings'). If 'Not Privileged', set to null.
16. responsiveness: 'Responsive' or 'Non-Responsive' (correlated to the case issues).
17. issue_tags: 1 to 4 relevant tags (e.g. 'Executive Knowledge', 'Audit Finding', 'Board Presentation', 'Draft Agreement').
18. litigation_scenario: '{config.scenario_type}'
19. synthetic_marker: 'SYNTHETIC_EVAL_RECORD'

OUTPUT FORMAT:
Return a JSON object with a single key "records" containing an array of exactly {batch_size} objects:
{{
  "records": [
    ...
  ]
}}
"""

    @staticmethod
    def build_correction_prompt(invalid_records: List[Dict[str, Any]], error_details: List[str]) -> str:
        return f"""
The following synthetic metadata records generated for e-discovery evaluation failed strict validation:

VALIDATION ERRORS:
{json.dumps(error_details, indent=2)}

INVALID RECORDS:
{json.dumps(invalid_records, indent=2)}

Please fix each of the invalid records so that:
1. All required fields are present and correctly typed.
2. All creation dates strictly match the required ISO date format and date range.
3. Every doc_id is preserved and correctly sequenced.
4. If privilege_status is not 'Not Privileged', privilege_basis is non-empty. If 'Not Privileged', privilege_basis is null.
5. doc_type is valid.

Return a JSON object with key "records" containing the repaired records:
{{
  "records": [ ... ]
}}
"""
