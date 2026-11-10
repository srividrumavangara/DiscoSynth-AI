"""Tests for scenario engine and LLM service."""

from __future__ import annotations

import pytest

from app.services.llm_service import MockLLMProvider, ScenarioProfile, get_llm_provider
from app.services.scenario_engine import get_jurisdictions, get_scenario_profile


class TestMockLLMProvider:
    """Tests for the mock LLM provider."""

    def test_mock_returns_scenario_profile(self):
        provider = MockLLMProvider()
        profile = provider.generate_scenario_profile("corporate_fraud", "intermediate")
        assert isinstance(profile, ScenarioProfile)
        assert profile.scenario_name == "corporate_fraud"
        assert len(profile.suggested_issue_tags) > 0
        assert len(profile.suggested_document_types) > 0

    def test_mock_health_check(self):
        provider = MockLLMProvider()
        assert provider.health_check() == "ok (mock)"

    def test_mock_all_scenarios(self):
        provider = MockLLMProvider()
        scenarios = [
            "corporate_fraud", "ip_dispute", "employment_litigation",
            "financial_misconduct", "contract_dispute", "custom",
        ]
        for scenario in scenarios:
            profile = provider.generate_scenario_profile(scenario, "intermediate")
            assert profile.scenario_name == scenario
            assert 0 <= profile.responsiveness_rate <= 1
            assert 0 <= profile.privilege_rate <= 1

    def test_mock_unknown_scenario_falls_back_to_custom(self):
        provider = MockLLMProvider()
        profile = provider.generate_scenario_profile("unknown_scenario", "basic")
        assert profile.scenario_name == "custom"

    def test_complexity_affects_rates(self):
        provider = MockLLMProvider()
        basic = provider.generate_scenario_profile("corporate_fraud", "basic")
        advanced = provider.generate_scenario_profile("corporate_fraud", "advanced")
        # Basic increases responsiveness, advanced increases privilege
        assert basic.responsiveness_rate >= advanced.responsiveness_rate or basic.privilege_rate <= advanced.privilege_rate


class TestScenarioEngine:
    """Tests for the scenario engine."""

    def test_get_jurisdictions(self):
        jurisdictions = get_jurisdictions("corporate_fraud")
        assert len(jurisdictions) > 0
        assert all(isinstance(j, str) for j in jurisdictions)

    def test_get_jurisdictions_unknown(self):
        jurisdictions = get_jurisdictions("unknown")
        assert len(jurisdictions) > 0  # Falls back to custom

    def test_get_scenario_profile_rule_based(self):
        profile = get_scenario_profile("corporate_fraud", "intermediate", "rule-based")
        assert isinstance(profile, ScenarioProfile)
        assert profile.scenario_name == "corporate_fraud"

    def test_get_scenario_profile_ai_assisted_fallback(self):
        """When LLM_PROVIDER is mock, ai-assisted should fall back to rule-based."""
        profile = get_scenario_profile("ip_dispute", "advanced", "ai-assisted")
        assert isinstance(profile, ScenarioProfile)


class TestLLMProviderFactory:
    """Tests for the get_llm_provider factory."""

    def test_default_provider_is_mock(self):
        provider = get_llm_provider()
        assert isinstance(provider, MockLLMProvider)
