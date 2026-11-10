"""Tests for API endpoints."""

from __future__ import annotations

import pytest


class TestHealthEndpoint:
    """Tests for GET /api/health."""

    def test_health_returns_200(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ("healthy", "degraded")
        assert "database" in data
        assert "llm_provider" in data

    def test_health_shows_mock_provider(self, client):
        response = client.get("/api/health")
        data = response.json()
        assert "mock" in data["llm_provider"].lower()


class TestGenerateEndpoint:
    """Tests for POST /api/generate."""

    def test_generate_basic_dataset(self, client, sample_generation_request):
        response = client.post("/api/generate", json=sample_generation_request)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Dataset"
        assert data["status"] == "completed"
        assert data["num_records"] == 100
        assert data["quality_score"] is not None
        assert data["quality_score"] > 0

    def test_generate_invalid_num_records(self, client, sample_generation_request):
        sample_generation_request["num_records"] = 999  # Not in allowed set
        response = client.post("/api/generate", json=sample_generation_request)
        assert response.status_code == 400

    def test_generate_missing_name(self, client, sample_generation_request):
        del sample_generation_request["name"]
        response = client.post("/api/generate", json=sample_generation_request)
        assert response.status_code == 422

    def test_generate_invalid_scenario(self, client, sample_generation_request):
        sample_generation_request["scenario"] = "nonexistent"
        response = client.post("/api/generate", json=sample_generation_request)
        assert response.status_code == 422


class TestDatasetsEndpoint:
    """Tests for dataset CRUD endpoints."""

    def test_list_datasets(self, client, sample_generation_request):
        # Generate a dataset first
        client.post("/api/generate", json=sample_generation_request)
        response = client.get("/api/datasets")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert len(data["items"]) >= 1

    def test_get_dataset_by_id(self, client, sample_generation_request):
        gen_resp = client.post("/api/generate", json=sample_generation_request)
        dataset_id = gen_resp.json()["id"]

        response = client.get(f"/api/datasets/{dataset_id}")
        assert response.status_code == 200
        assert response.json()["id"] == dataset_id

    def test_get_dataset_not_found(self, client):
        response = client.get("/api/datasets/nonexistent-id")
        assert response.status_code == 404

    def test_get_dataset_records(self, client, sample_generation_request):
        gen_resp = client.post("/api/generate", json=sample_generation_request)
        dataset_id = gen_resp.json()["id"]

        response = client.get(f"/api/datasets/{dataset_id}/records")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 100
        assert len(data["items"]) <= 25  # Default page size

    def test_get_dataset_records_with_filters(self, client, sample_generation_request):
        gen_resp = client.post("/api/generate", json=sample_generation_request)
        dataset_id = gen_resp.json()["id"]

        response = client.get(
            f"/api/datasets/{dataset_id}/records",
            params={"document_type": "email", "page_size": 10},
        )
        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["document_type"] == "email"

    def test_delete_dataset(self, client, sample_generation_request):
        gen_resp = client.post("/api/generate", json=sample_generation_request)
        dataset_id = gen_resp.json()["id"]

        del_resp = client.delete(f"/api/datasets/{dataset_id}")
        assert del_resp.status_code == 204

        get_resp = client.get(f"/api/datasets/{dataset_id}")
        assert get_resp.status_code == 404


class TestAnalyticsEndpoint:
    """Tests for analytics and quality endpoints."""

    def test_get_analytics(self, client, sample_generation_request):
        gen_resp = client.post("/api/generate", json=sample_generation_request)
        dataset_id = gen_resp.json()["id"]

        response = client.get(f"/api/datasets/{dataset_id}/analytics")
        assert response.status_code == 200
        data = response.json()
        assert "document_type_distribution" in data
        assert "responsive_distribution" in data
        assert "privilege_distribution" in data
        assert "timeline" in data
        assert data["total_records"] == 100

    def test_get_quality(self, client, sample_generation_request):
        gen_resp = client.post("/api/generate", json=sample_generation_request)
        dataset_id = gen_resp.json()["id"]

        response = client.get(f"/api/datasets/{dataset_id}/quality")
        assert response.status_code == 200
        data = response.json()
        assert "quality_score" in data
        assert "breakdown" in data
        assert data["total_records"] == 100

    def test_analytics_not_found(self, client):
        response = client.get("/api/datasets/nonexistent/analytics")
        assert response.status_code == 404
