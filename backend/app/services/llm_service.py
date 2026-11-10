"""LLM provider abstraction for DiscoSynth AI.

Supports a mock provider (no API key required) and a Gemini provider.
"""

from __future__ import annotations

import json
import logging
from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel, Field

from app.config import get_settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# ScenarioProfile — the structured output from any LLM provider
# ---------------------------------------------------------------------------

class ScenarioProfile(BaseModel):
    """Structured scenario profile used to drive data generation."""

    scenario_name: str
    description: str
    suggested_document_types: dict[str, float] = Field(
        default_factory=dict,
        description="Mapping of document type -> weight (0-1).",
    )
    suggested_issue_tags: list[str] = Field(default_factory=list)
    custodian_roles: dict[str, float] = Field(
        default_factory=dict,
        description="Mapping of custodian role -> weight (0-1).",
    )
    responsiveness_rate: float = Field(0.35, ge=0.0, le=1.0)
    privilege_rate: float = Field(0.15, ge=0.0, le=1.0)
    confidentiality_distribution: dict[str, float] = Field(default_factory=dict)
    typical_date_range: dict[str, str] = Field(
        default_factory=lambda: {"start": "2021-01-01", "end": "2024-06-30"},
    )
    organizational_context: str = ""


# ---------------------------------------------------------------------------
# Abstract base class
# ---------------------------------------------------------------------------

class LLMProvider(ABC):
    """Abstract base for LLM-backed scenario enrichment."""

    @abstractmethod
    def generate_scenario_profile(self, scenario: str, complexity: str) -> ScenarioProfile:
        """Return a ScenarioProfile for the given scenario and complexity."""
        ...

    @abstractmethod
    def health_check(self) -> str:
        """Return a short status string such as 'ok' or 'unavailable'."""
        ...


# ---------------------------------------------------------------------------
# Mock provider — works without any API key
# ---------------------------------------------------------------------------

_MOCK_PROFILES: dict[str, dict[str, Any]] = {
    "corporate_fraud": {
        "scenario_name": "corporate_fraud",
        "description": "Investigation into suspected corporate fraud involving financial misrepresentation, embezzlement, and insider trading at Synthetica Global Corp.",
        "suggested_document_types": {
            "email": 0.35, "pdf": 0.15, "financial_report": 0.20,
            "internal_memo": 0.15, "xlsx": 0.10, "contract": 0.05,
        },
        "suggested_issue_tags": [
            "fraud", "embezzlement", "insider-trading", "SEC-violation",
            "accounting-irregularity", "wire-transfer", "shell-company",
            "audit-discrepancy", "whistleblower",
        ],
        "custodian_roles": {
            "executive": 0.25, "financial_analyst": 0.25, "legal_counsel": 0.15,
            "board_member": 0.10, "it_admin": 0.05, "consultant": 0.10,
            "hr_manager": 0.05, "sales_rep": 0.05,
        },
        "responsiveness_rate": 0.40,
        "privilege_rate": 0.18,
        "confidentiality_distribution": {
            "public": 0.05, "internal": 0.30, "confidential": 0.45, "highly_confidential": 0.20,
        },
        "typical_date_range": {"start": "2021-03-01", "end": "2024-06-30"},
        "organizational_context": "Synthetica Global Corp, a multinational conglomerate headquartered in New York, is under investigation for suspected financial fraud spanning three fiscal years.",
    },
    "ip_dispute": {
        "scenario_name": "ip_dispute",
        "description": "Intellectual property dispute between NovaTech Innovations and Apex Solutions regarding patented semiconductor design technology.",
        "suggested_document_types": {
            "email": 0.30, "pdf": 0.20, "docx": 0.15,
            "internal_memo": 0.10, "contract": 0.15, "xlsx": 0.10,
        },
        "suggested_issue_tags": [
            "patent-infringement", "trade-secret", "prior-art", "licensing",
            "R&D-documentation", "non-compete", "design-specification",
            "reverse-engineering", "royalty-dispute",
        ],
        "custodian_roles": {
            "executive": 0.15, "legal_counsel": 0.20, "it_admin": 0.15,
            "consultant": 0.20, "financial_analyst": 0.10, "sales_rep": 0.10,
            "hr_manager": 0.05, "board_member": 0.05,
        },
        "responsiveness_rate": 0.35,
        "privilege_rate": 0.22,
        "confidentiality_distribution": {
            "public": 0.10, "internal": 0.25, "confidential": 0.40, "highly_confidential": 0.25,
        },
        "typical_date_range": {"start": "2020-06-01", "end": "2024-03-31"},
        "organizational_context": "NovaTech Innovations, a mid-size semiconductor firm, alleges that Apex Solutions misappropriated patented chip design methodologies.",
    },
    "employment_litigation": {
        "scenario_name": "employment_litigation",
        "description": "Class-action employment litigation involving allegations of workplace discrimination and wrongful termination at Meridian Services Inc.",
        "suggested_document_types": {
            "email": 0.35, "docx": 0.20, "internal_memo": 0.20,
            "pdf": 0.10, "xlsx": 0.10, "contract": 0.05,
        },
        "suggested_issue_tags": [
            "discrimination", "wrongful-termination", "harassment",
            "HR-complaint", "performance-review", "policy-violation",
            "retaliation", "accommodation-request", "severance",
        ],
        "custodian_roles": {
            "hr_manager": 0.30, "executive": 0.15, "legal_counsel": 0.15,
            "sales_rep": 0.10, "it_admin": 0.05, "consultant": 0.05,
            "financial_analyst": 0.10, "board_member": 0.10,
        },
        "responsiveness_rate": 0.45,
        "privilege_rate": 0.20,
        "confidentiality_distribution": {
            "public": 0.05, "internal": 0.35, "confidential": 0.40, "highly_confidential": 0.20,
        },
        "typical_date_range": {"start": "2022-01-01", "end": "2024-09-30"},
        "organizational_context": "Meridian Services Inc., a national staffing company, faces a class-action lawsuit from former employees alleging systemic discrimination.",
    },
    "financial_misconduct": {
        "scenario_name": "financial_misconduct",
        "description": "Regulatory investigation into financial misconduct and money laundering at Pinnacle Capital Partners.",
        "suggested_document_types": {
            "financial_report": 0.25, "email": 0.25, "xlsx": 0.20,
            "pdf": 0.10, "internal_memo": 0.10, "contract": 0.10,
        },
        "suggested_issue_tags": [
            "money-laundering", "regulatory-violation", "AML-compliance",
            "suspicious-transaction", "KYC-failure", "offshore-account",
            "wire-fraud", "tax-evasion", "sanctions-violation",
        ],
        "custodian_roles": {
            "financial_analyst": 0.30, "executive": 0.20, "legal_counsel": 0.15,
            "consultant": 0.10, "board_member": 0.10, "it_admin": 0.05,
            "hr_manager": 0.05, "sales_rep": 0.05,
        },
        "responsiveness_rate": 0.38,
        "privilege_rate": 0.16,
        "confidentiality_distribution": {
            "public": 0.05, "internal": 0.20, "confidential": 0.45, "highly_confidential": 0.30,
        },
        "typical_date_range": {"start": "2020-01-01", "end": "2024-04-30"},
        "organizational_context": "Pinnacle Capital Partners, an investment firm headquartered in Chicago, is under federal investigation for suspected money-laundering operations.",
    },
    "contract_dispute": {
        "scenario_name": "contract_dispute",
        "description": "Commercial contract dispute between Orion Manufacturing and Atlas Supply Chain regarding breach of a multi-year procurement agreement.",
        "suggested_document_types": {
            "contract": 0.25, "email": 0.25, "pdf": 0.15,
            "docx": 0.15, "xlsx": 0.10, "internal_memo": 0.10,
        },
        "suggested_issue_tags": [
            "breach-of-contract", "force-majeure", "indemnification",
            "SLA-violation", "payment-dispute", "delivery-delay",
            "warranty-claim", "termination-clause", "damages",
        ],
        "custodian_roles": {
            "executive": 0.20, "legal_counsel": 0.20, "sales_rep": 0.20,
            "financial_analyst": 0.15, "consultant": 0.10, "board_member": 0.05,
            "hr_manager": 0.05, "it_admin": 0.05,
        },
        "responsiveness_rate": 0.42,
        "privilege_rate": 0.20,
        "confidentiality_distribution": {
            "public": 0.10, "internal": 0.30, "confidential": 0.40, "highly_confidential": 0.20,
        },
        "typical_date_range": {"start": "2021-06-01", "end": "2024-08-31"},
        "organizational_context": "Orion Manufacturing alleges that Atlas Supply Chain breached a $45M procurement contract by failing to meet delivery schedules and quality standards.",
    },
    "custom": {
        "scenario_name": "custom",
        "description": "Custom litigation scenario with configurable parameters for flexible e-discovery testing.",
        "suggested_document_types": {
            "email": 0.25, "pdf": 0.20, "docx": 0.15,
            "xlsx": 0.10, "internal_memo": 0.10, "financial_report": 0.10, "contract": 0.10,
        },
        "suggested_issue_tags": [
            "general-dispute", "compliance", "investigation",
            "document-review", "legal-hold", "preservation",
        ],
        "custodian_roles": {
            "executive": 0.15, "legal_counsel": 0.15, "financial_analyst": 0.15,
            "hr_manager": 0.10, "it_admin": 0.10, "sales_rep": 0.15,
            "consultant": 0.10, "board_member": 0.10,
        },
        "responsiveness_rate": 0.35,
        "privilege_rate": 0.15,
        "confidentiality_distribution": {
            "public": 0.15, "internal": 0.35, "confidential": 0.35, "highly_confidential": 0.15,
        },
        "typical_date_range": {"start": "2022-01-01", "end": "2024-12-31"},
        "organizational_context": "Fictional Consolidated Industries, a diversified holding company, is involved in a general litigation matter requiring broad document review.",
    },
}


class MockLLMProvider(LLMProvider):
    """Returns hardcoded scenario profiles — no API key required."""

    def generate_scenario_profile(self, scenario: str, complexity: str) -> ScenarioProfile:
        """Return a mock ScenarioProfile for the requested scenario."""
        data = _MOCK_PROFILES.get(scenario, _MOCK_PROFILES["custom"]).copy()
        # Adjust weights slightly by complexity for realism.
        if complexity == "basic":
            data["responsiveness_rate"] = round(data["responsiveness_rate"] * 1.1, 2)
        elif complexity == "advanced":
            data["privilege_rate"] = round(min(data["privilege_rate"] * 1.2, 0.95), 2)
        return ScenarioProfile(**data)

    def health_check(self) -> str:
        return "ok (mock)"


# ---------------------------------------------------------------------------
# Gemini provider — requires GEMINI_API_KEY
# ---------------------------------------------------------------------------

class GeminiLLMProvider(LLMProvider):
    """Uses Google Gemini (google-generativeai SDK) for scenario enrichment."""

    def __init__(self, api_key: str) -> None:
        self._api_key = api_key
        self._model_name = "gemini-1.5-flash"
        self._configured = False
        try:
            import google.generativeai as genai  # type: ignore[import-untyped]

            genai.configure(api_key=self._api_key)
            self._genai = genai
            self._configured = True
        except Exception:
            logger.warning("google-generativeai SDK could not be configured. Falling back to mock.")

    def generate_scenario_profile(self, scenario: str, complexity: str) -> ScenarioProfile:
        """Generate a scenario profile via Gemini, with retry and timeout."""
        if not self._configured:
            return MockLLMProvider().generate_scenario_profile(scenario, complexity)

        prompt = (
            f"You are an e-discovery litigation expert. Generate a detailed scenario profile "
            f"for a '{scenario}' litigation with '{complexity}' complexity.\n\n"
            f"Return ONLY valid JSON matching this schema:\n"
            f"{json.dumps(ScenarioProfile.model_json_schema(), indent=2)}\n\n"
            f"Make the scenario realistic with a fictional company. "
            f"All values must be properly weighted (weights sum close to 1.0 where applicable). "
            f"Use only these document types: email, pdf, docx, xlsx, internal_memo, financial_report, contract. "
            f"Use only these custodian roles: executive, legal_counsel, financial_analyst, hr_manager, it_admin, sales_rep, consultant, board_member."
        )

        max_retries = 3
        for attempt in range(max_retries):
            try:
                model = self._genai.GenerativeModel(self._model_name)
                response = model.generate_content(
                    prompt,
                    generation_config=self._genai.types.GenerationConfig(
                        response_mime_type="application/json",
                        temperature=0.7,
                    ),
                    request_options={"timeout": 30},
                )
                raw = response.text.strip()
                # Strip markdown fences if present
                if raw.startswith("```"):
                    raw = raw.split("\n", 1)[1]
                    if raw.endswith("```"):
                        raw = raw[: -3]
                data = json.loads(raw)
                return ScenarioProfile(**data)
            except Exception as exc:
                logger.warning("Gemini attempt %d failed: %s", attempt + 1, exc)
                if attempt == max_retries - 1:
                    logger.error("All Gemini retries exhausted — falling back to mock provider.")
                    return MockLLMProvider().generate_scenario_profile(scenario, complexity)

        # Should never reach here, but satisfy type checker.
        return MockLLMProvider().generate_scenario_profile(scenario, complexity)  # pragma: no cover

    def health_check(self) -> str:
        if not self._configured:
            return "unavailable (SDK not configured)"
        try:
            model = self._genai.GenerativeModel(self._model_name)
            model.generate_content("ping", request_options={"timeout": 10})
            return "ok (gemini)"
        except Exception as exc:
            return f"degraded ({exc})"


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

def get_llm_provider() -> LLMProvider:
    """Return the appropriate LLM provider based on application settings."""
    settings = get_settings()
    if settings.LLM_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        return GeminiLLMProvider(api_key=settings.GEMINI_API_KEY)
    return MockLLMProvider()
