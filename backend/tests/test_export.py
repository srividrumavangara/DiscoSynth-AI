"""Tests for CSV and JSON export functionality."""

from __future__ import annotations

import csv
import io
import json

import pytest


class TestExport:
    """Tests for the export endpoints."""

    def test_export_csv(self, client, sample_generation_request):
        gen_resp = client.post("/api/generate", json=sample_generation_request)
        dataset_id = gen_resp.json()["id"]

        response = client.get(f"/api/datasets/{dataset_id}/export?format=csv")
        assert response.status_code == 200
        assert "text/csv" in response.headers["content-type"]
        assert "attachment" in response.headers.get("content-disposition", "")

        # Parse CSV content (skip comment lines)
        content = response.text
        lines = [line for line in content.splitlines() if not line.startswith("#")]
        reader = csv.DictReader(io.StringIO("\n".join(lines)))
        rows = list(reader)
        assert len(rows) == 100

        # Verify columns
        expected_cols = {"document_id", "case_id", "document_type", "custodian_id", "responsive"}
        assert expected_cols <= set(rows[0].keys())

    def test_export_json(self, client, sample_generation_request):
        gen_resp = client.post("/api/generate", json=sample_generation_request)
        dataset_id = gen_resp.json()["id"]

        response = client.get(f"/api/datasets/{dataset_id}/export?format=json")
        assert response.status_code == 200
        assert "application/json" in response.headers["content-type"]

        data = response.json()
        assert "manifest" in data
        assert "records" in data
        assert len(data["records"]) == 100
        assert data["manifest"]["disclaimer"] is not None

    def test_export_not_found(self, client):
        response = client.get("/api/datasets/nonexistent/export?format=csv")
        assert response.status_code == 404

    def test_export_json_has_manifest(self, client, sample_generation_request):
        gen_resp = client.post("/api/generate", json=sample_generation_request)
        dataset_id = gen_resp.json()["id"]

        response = client.get(f"/api/datasets/{dataset_id}/export?format=json")
        manifest = response.json()["manifest"]
        assert "dataset_id" in manifest
        assert "scenario" in manifest
        assert "total_records" in manifest
        assert manifest["total_records"] == 100
