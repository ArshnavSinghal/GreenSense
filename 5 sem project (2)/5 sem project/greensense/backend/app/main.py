from fastapi import FastAPI
from app.api.v1 import sensors, predictions, ndvi

app = FastAPI(title="GreenSense Backend")

app.include_router(sensors.router, prefix="/sensors", tags=["Sensors"])
app.include_router(predictions.router, prefix="/predict", tags=["Prediction"])
app.include_router(ndvi.router, prefix="/ndvi", tags=["NDVI"])

@app.get("/")
def root():
    return {"message": "GreenSense API running"}
