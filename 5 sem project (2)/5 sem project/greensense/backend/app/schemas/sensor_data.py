from pydantic import BaseModel

class SensorDataCreate(BaseModel):
    temperature: float
    humidity: float
    air_quality: float
