"""Auth API (placeholder)"""
from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login():
    return {"access_token": "fake-token"}
