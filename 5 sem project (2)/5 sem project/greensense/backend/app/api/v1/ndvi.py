from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def ndvi_demo():
    return {"ndvi": "NDVI calculation will be implemented later"}
