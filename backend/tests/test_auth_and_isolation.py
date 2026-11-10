"""Tests for Supabase JWT verification, user ownership, and two-user isolation."""

from __future__ import annotations

import time
import jwt
import pytest
from app.auth import verify_supabase_jwt
from app.config import get_settings


class TestJWTVerification:
    """Test token verification, expiration, and audience requirements."""

    def test_missing_token_raises_401(self, unauth_client):
        """Unauthenticated requests to protected endpoints return 401."""
        resp = unauth_client.get("/api/datasets")
        assert resp.status_code == 401
        assert "detail" in resp.json()

    def test_invalid_bearer_token_format(self, unauth_client):
        """Empty or invalid authorization header returns 401."""
        resp = unauth_client.get("/api/datasets", headers={"Authorization": "Bearer "})
        assert resp.status_code == 401

    def test_valid_hs256_token_with_secret(self, monkeypatch):
        """When SUPABASE_JWT_SECRET is set, properly signed tokens verify correctly."""
        test_secret = "test-super-secret-jwt-key-32-chars-long"
        monkeypatch.setenv("SUPABASE_JWT_SECRET", test_secret)
        get_settings.cache_clear()

        try:
            payload = {
                "sub": "00000000-0000-0000-0000-000000000001",
                "email": "counsel@firm.com",
                "aud": "authenticated",
                "role": "authenticated",
                "exp": int(time.time()) + 3600,
            }
            token = jwt.encode(payload, test_secret, algorithm="HS256")
            user = verify_supabase_jwt(token)
            assert user.id == "00000000-0000-0000-0000-000000000001"
            assert user.email == "counsel@firm.com"
        finally:
            get_settings.cache_clear()

    def test_expired_token_rejected(self, monkeypatch):
        """Expired JWTs are rejected with 401 Unauthorized."""
        from fastapi import HTTPException

        test_secret = "test-super-secret-jwt-key-32-chars-long"
        monkeypatch.setenv("SUPABASE_JWT_SECRET", test_secret)
        get_settings.cache_clear()

        try:
            expired_payload = {
                "sub": "00000000-0000-0000-0000-000000000001",
                "email": "counsel@firm.com",
                "aud": "authenticated",
                "role": "authenticated",
                "exp": int(time.time()) - 100,  # Expired
            }
            token = jwt.encode(expired_payload, test_secret, algorithm="HS256")
            with pytest.raises(HTTPException) as exc_info:
                verify_supabase_jwt(token)
            assert exc_info.value.status_code == 401
            assert "expired" in exc_info.value.detail.lower()
        finally:
            get_settings.cache_clear()

    def test_tampered_signature_rejected(self, monkeypatch):
        """Tokens signed with a different key are rejected."""
        from fastapi import HTTPException

        test_secret = "test-super-secret-jwt-key-32-chars-long"
        monkeypatch.setenv("SUPABASE_JWT_SECRET", test_secret)
        get_settings.cache_clear()

        try:
            payload = {
                "sub": "00000000-0000-0000-0000-000000000001",
                "email": "counsel@firm.com",
                "aud": "authenticated",
                "exp": int(time.time()) + 3600,
            }
            # Sign with WRONG secret
            token = jwt.encode(payload, "wrong-forged-secret-key-12345678", algorithm="HS256")
            with pytest.raises(HTTPException) as exc_info:
                verify_supabase_jwt(token)
            assert exc_info.value.status_code == 401
        finally:
            get_settings.cache_clear()


class TestTwoUserIsolation:
    """Rigorous tests proving User A cannot read, export, or mutate User B's datasets."""

    def test_user_a_and_user_b_dataset_isolation(
        self, client_user_a, client_user_b, sample_generation_request
    ):
        """User A creates a dataset. User B cannot see it, read it, or access records."""
        # 1. User A generates a dataset
        req_a = dict(sample_generation_request, name="Alice Confidential Investigation")
        resp_a = client_user_a.post("/api/generate", json=req_a)
        assert resp_a.status_code == 201
        dataset_a_id = resp_a.json()["id"]
        assert resp_a.json()["user_id"] == "mock-user-alice"

        # 2. User B lists datasets -> must NOT contain User A's dataset
        list_resp_b = client_user_b.get("/api/datasets")
        assert list_resp_b.status_code == 200
        ids_seen_by_b = [d["id"] for d in list_resp_b.json()["items"]]
        assert dataset_a_id not in ids_seen_by_b

        # 3. User B tries to directly GET User A's dataset -> 403 Forbidden
        direct_resp_b = client_user_b.get(f"/api/datasets/{dataset_a_id}")
        assert direct_resp_b.status_code == 403

        # 4. User B tries to directly fetch records of User A's dataset -> 403 Forbidden
        records_resp_b = client_user_b.get(f"/api/datasets/{dataset_a_id}/records")
        assert records_resp_b.status_code == 403

        # 5. User B tries to access analytics of User A's dataset -> 403 Forbidden
        analytics_resp_b = client_user_b.get(f"/api/datasets/{dataset_a_id}/analytics")
        assert analytics_resp_b.status_code == 403

        # 6. User B tries to export User A's dataset -> 403 Forbidden
        export_resp_b = client_user_b.get(f"/api/datasets/{dataset_a_id}/export?format=csv")
        assert export_resp_b.status_code == 403

        # 7. User B tries to DELETE User A's dataset -> 403 Forbidden
        delete_resp_b = client_user_b.delete(f"/api/datasets/{dataset_a_id}")
        assert delete_resp_b.status_code == 403

        # 8. User A can still retrieve, view records, export, and delete their own dataset
        assert client_user_a.get(f"/api/datasets/{dataset_a_id}").status_code == 200
        assert client_user_a.get(f"/api/datasets/{dataset_a_id}/records").status_code == 200
        assert client_user_a.get(f"/api/datasets/{dataset_a_id}/export?format=csv").status_code == 200
        assert client_user_a.delete(f"/api/datasets/{dataset_a_id}").status_code == 204

    def test_generation_history_isolation(
        self, client_user_a, client_user_b, sample_generation_request
    ):
        """Generation audit history logs are partitioned strictly per user."""
        req = dict(sample_generation_request, name="Alice Audit Test")
        client_user_a.post("/api/generate", json=req)

        # Alice checks history
        hist_a = client_user_a.get("/api/history")
        assert hist_a.status_code == 200
        assert len(hist_a.json()["items"]) >= 1

        # Bob checks history -> Alice's entry must not appear
        hist_b = client_user_b.get("/api/history")
        assert hist_b.status_code == 200
        for entry in hist_b.json()["items"]:
            assert entry["user_id"] == "mock-user-bob"
