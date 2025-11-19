from sqlalchemy import Column, Integer, Float
from app.db.base import Base

class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float)
    humidity = Column(Float)
    air_quality = Column(Float)
