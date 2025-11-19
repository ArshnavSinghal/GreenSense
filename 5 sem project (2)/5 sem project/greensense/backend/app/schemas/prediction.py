"""Prediction schemas placeholder"""
from pydantic import BaseModel
from datetime import datetime

class PredictionBase(BaseModel):
    score: float
    timestamp: datetime

class Prediction(PredictionBase):
    id: int
    class Config:
        orm_mode = True
