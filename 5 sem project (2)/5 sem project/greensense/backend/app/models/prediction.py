"""Prediction model placeholder"""
from sqlalchemy import Column, Integer, Float, DateTime
from ..db.base import Base

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    score = Column(Float)
    timestamp = Column(DateTime)
