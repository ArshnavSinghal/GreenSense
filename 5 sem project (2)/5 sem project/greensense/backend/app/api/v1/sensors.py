from fastapi import APIRouter
from app.schemas.sensor_data import SensorDataCreate
from app.models.sensor_data import SensorData
from app.db.session import SessionLocal

router = APIRouter()

@router.post("/")
def add_sensor_data(data: SensorDataCreate):
    db = SessionLocal()
    new_data = SensorData(
        temperature=data.temperature,
        humidity=data.humidity,
        air_quality=data.air_quality
    )
    db.add(new_data)
    db.commit()
    db.refresh(new_data)
    return {"message": "Sensor data stored", "data": new_data}


@router.get("/latest")
def get_latest():
    db = SessionLocal()
    data = db.query(SensorData).order_by(SensorData.id.desc()).first()
    return data
