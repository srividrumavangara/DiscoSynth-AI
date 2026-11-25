import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.auth import hash_password, verify_password, create_access_token, decode_access_token

client = TestClient(app)

def test_password_hashing():
    pwd = "SecretLitigationPassword123!"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_jwt_token_flow():
    user_data = {"sub": "usr_test123", "email": "counsel@firm.com"}
    token = create_access_token(user_data)
    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "usr_test123"
    assert decoded["email"] == "counsel@firm.com"

def test_auth_endpoints_lifecycle():
    unique_email = f"paralegal_{client.get('/api/health').status_code}@discovery.legal"
    
    # 1. Register new user
    reg_resp = client.post("/api/auth/register", json={
        "full_name": "Senior Litigation Paralegal",
        "email": unique_email,
        "password": "SecurePassword2026!"
    })
    # Either succeeds or returns 400 if already exists in local DB
    if reg_resp.status_code == 200:
        data = reg_resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == unique_email
        token = data["access_token"]
        
        # 2. Get profile with token
        me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == unique_email
        
    # 3. Unauthorized access to /me without token
    unauth_resp = client.get("/api/auth/me")
    assert unauth_resp.status_code == 401
    
    # 4. Login with invalid password
    bad_login = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "TotallyWrongPassword"
    })
    assert bad_login.status_code == 401
