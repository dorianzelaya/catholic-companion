from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
class DailyContent(Base):
    __tablename__ = "daily_content"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, unique=True, index=True, nullable=False)
    liturgical_season = Column(String, nullable=True)
    first_reading_ref = Column(String, nullable=True)
    first_reading_text = Column(String, nullable=True)
    psalm_ref = Column(String, nullable=True)
    psalm_text = Column(String, nullable=True)
    second_reading_ref = Column(String, nullable=True)
    second_reading_text = Column(String, nullable=True)
    gospel_ref = Column(String, nullable=True)
    gospel_text = Column(String, nullable=True)
    saint_name = Column(String, nullable=True)
    saint_type = Column(String, nullable=True)
    saint_description = Column(String, nullable=True)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())
    
    