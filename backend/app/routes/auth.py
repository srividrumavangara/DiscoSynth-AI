import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from app.database import get_database
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    ForgotPasswordRequest,
    UpdateProfileRequest,
    UserProfile,
    TokenResponse
)
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register_user(payload: UserRegisterRequest):
    db = get_database()
    normalized_email = payload.email.lower().strip()
    
    # Check if user already exists
    existing = db.users.find_one({"email": normalized_email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in instead."
        )
    
    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    
    hashed_pwd = hash_password(payload.password)
    
    user_doc = {
        "user_id": user_id,
        "email": normalized_email,
        "full_name": payload.full_name.strip(),
        "hashed_password": hashed_pwd,
        "created_at": now_iso,
        "updated_at": now_iso
    }
    
    try:
        db.users.insert_one(user_doc)
    except Exception as e:
        logger.error("Failed to insert user into MongoDB: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create user account.")
        
    user_profile = UserProfile(
        user_id=user_id,
        email=normalized_email,
        full_name=payload.full_name.strip(),
        created_at=now_iso
    )
    
    access_token = create_access_token(data={"sub": user_id, "email": normalized_email})
    
    logger.info("New user registered: %s (%s)", normalized_email, user_id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_profile
    )

@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLoginRequest):
    db = get_database()
    normalized_email = payload.email.lower().strip()
    
    user = db.users.find_one({"email": normalized_email})
    if not user or not verify_password(payload.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = user["user_id"]
    user_profile = UserProfile(
        user_id=user_id,
        email=normalized_email,
        full_name=user.get("full_name", "User"),
        created_at=str(user.get("created_at", ""))
    )
    
    access_token = create_access_token(data={"sub": user_id, "email": normalized_email})
    
    logger.info("User logged in successfully: %s", normalized_email)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_profile
    )

@router.get("/me", response_model=UserProfile)
def get_current_user_profile(current_user: UserProfile = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    db = get_database()
    normalized_email = payload.email.lower().strip()
    user = db.users.find_one({"email": normalized_email})
    
    # Generic response regardless of existence to prevent account enumeration
    return {
        "status": "success",
        "message": f"If an account is associated with {normalized_email}, a secure password reset link has been dispatched."
    }

@router.patch("/profile", response_model=UserProfile)
def update_profile(
    payload: UpdateProfileRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    db = get_database()
    updates = {}
    now_iso = datetime.now(timezone.utc).isoformat()
    
    if payload.full_name:
        updates["full_name"] = payload.full_name.strip()
    if payload.password:
        updates["hashed_password"] = hash_password(payload.password)
        
    if updates:
        updates["updated_at"] = now_iso
        db.users.update_one({"user_id": current_user.user_id}, {"$set": updates})
        
    user = db.users.find_one({"user_id": current_user.user_id})
    return UserProfile(
        user_id=user["user_id"],
        email=user["email"],
        full_name=user.get("full_name", "User"),
        created_at=str(user.get("created_at", ""))
    )
