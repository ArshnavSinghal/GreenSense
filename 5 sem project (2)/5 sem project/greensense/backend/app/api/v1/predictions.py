from fastapi import APIRouter
from app.services.ml_service import MLService

router = APIRouter()
ml = MLService()

@router.get("/")
def predict():
    prediction = ml.simple_predict()
    return {"prediction": prediction}
