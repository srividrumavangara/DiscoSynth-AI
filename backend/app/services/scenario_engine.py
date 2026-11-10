"""Scenario engine — maps litigation scenarios to generation profiles.

Provides hardcoded scenario profiles and optionally enriches them via an LLM.
"""

from __future__ import annotations

import logging

from app.services.llm_service import (
    LLMProvider,
    MockLLMProvider,
    ScenarioProfile,
    get_llm_provider,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Hardcoded scenario data (used as fallback and baseline)
# ---------------------------------------------------------------------------

_SCENARIO_JURISDICTIONS: dict[str, list[str]] = {
    "corporate_fraud": [
        "New York, USA", "Delaware, USA", "London, UK",
        "Singapore", "Zurich, Switzerland",
    ],
    "ip_dispute": [
        "Northern District of California, USA", "Delaware, USA",
        "Eastern District of Texas, USA", "Munich, Germany", "Tokyo, Japan",
    ],
    "employment_litigation": [
        "California, USA", "New York, USA", "Illinois, USA",
        "Texas, USA", "Florida, USA",
    ],
    "financial_misconduct": [
        "Southern District of New York, USA", "London, UK",
        "Hong Kong", "Frankfurt, Germany", "Cayman Islands",
    ],
    "contract_dispute": [
        "Delaware, USA", "New York, USA", "London, UK",
        "Dubai, UAE", "Toronto, Canada",
    ],
    "custom": [
        "New York, USA", "California, USA", "London, UK",
        "Sydney, Australia", "Toronto, Canada",
    ],
}


def get_jurisdictions(scenario: str) -> list[str]:
    """Return a list of plausible jurisdictions for the given scenario."""
    return _SCENARIO_JURISDICTIONS.get(scenario, _SCENARIO_JURISDICTIONS["custom"])


def get_scenario_profile(
    scenario: str,
    complexity: str,
    generation_method: str = "rule-based",
    provider: LLMProvider | None = None,
) -> ScenarioProfile:
    """Build a ScenarioProfile for the given scenario and complexity.

    If *generation_method* is ``"ai-assisted"`` and a live LLM provider is
    available, the profile will be generated (or enriched) by the LLM.
    Otherwise the mock / hardcoded profiles are used.

    Parameters
    ----------
    scenario:
        One of the ``Scenario`` enum values.
    complexity:
        One of ``basic``, ``intermediate``, ``advanced``.
    generation_method:
        ``"rule-based"`` or ``"ai-assisted"``.
    provider:
        Optional explicit LLM provider (useful for testing).
    """
    if provider is None:
        provider = get_llm_provider()

    if generation_method == "ai-assisted" and not isinstance(provider, MockLLMProvider):
        try:
            profile = provider.generate_scenario_profile(scenario, complexity)
            logger.info("Scenario profile generated via LLM for '%s'.", scenario)
            return profile
        except Exception:
            logger.warning("LLM enrichment failed; falling back to rule-based profile.")

    # Default: use the mock provider's hardcoded data.
    mock = MockLLMProvider()
    return mock.generate_scenario_profile(scenario, complexity)
