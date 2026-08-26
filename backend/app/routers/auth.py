from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import User, HEI
from app.schemas.dtos import UserCreate, UserLogin, TokenResponse, UserOut
from app.auth.security import get_password_hash, verify_password, create_access_token
from app.auth.dependencies import get_current_user
from typing import List, Dict, Any

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    # Valid roles: citizen, hei_reviewer, industry_partner, govt_admin
    valid_roles = ["citizen", "hei_reviewer", "industry_partner", "govt_admin"]
    role = user_in.role if user_in.role in valid_roles else "citizen"

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=role,
        district=user_in.district or "Ranchi",
        organization=user_in.organization
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=Dict[str, Any])
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "role": current_user.role,
        "district": current_user.district,
        "organization": current_user.organization,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }
    if current_user.role == "hei_reviewer":
        hei = db.query(HEI).filter(HEI.user_id == current_user.id).first()
        if hei:
            res["hei"] = {
                "id": hei.id,
                "institute_name": hei.institute_name,
                "aishe_code": hei.aishe_code,
                "district": hei.district,
                "specializations": hei.specializations
            }
    return res


@router.get("/demo-users", response_model=List[Dict[str, str]])
def list_demo_users():
    """Provides 1-click test credentials for evaluators."""
    return [
        {"role": "citizen", "email": "citizen@samadhansetu.jh.gov.in", "name": "Ramesh Kumar (Citizen)", "portal": "/citizen"},
        {"role": "hei_reviewer", "email": "bit.mesra@samadhansetu.jh.gov.in", "name": "Dr. A. Verma (BIT Mesra)", "portal": "/hei"},
        {"role": "industry_partner", "email": "csr@tatasteel.com", "name": "Tata Steel CSR Lead", "portal": "/industry"},
        {"role": "govt_admin", "email": "admin@jharkhand.gov.in", "name": "Dept. of Higher Education Admin", "portal": "/govt"},
    ]
