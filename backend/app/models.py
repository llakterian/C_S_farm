from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    FARMER = "farmer"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default=UserRole.FARMER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tasks = relationship("Task", back_populates="assigned_to")

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(String)  # e.g., Vegetable, Fruit, Grain
    variety = Column(String)
    planting_date = Column(DateTime(timezone=True))
    harvest_date_est = Column(DateTime(timezone=True))
    status = Column(String, default="Planted")  # Planted, Growing, Ready, Harvested
    location = Column(String)
    image_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Livestock(Base):
    __tablename__ = "livestock"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) # e.g., "Bessie"
    type = Column(String, nullable=False) # e.g., Cow, Goat
    breed = Column(String)
    birth_date = Column(DateTime(timezone=True))
    health_status = Column(String, default="Healthy")
    image_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String) # Seeds, Fertilizer, Tools
    quantity = Column(Float, default=0.0)
    unit = Column(String) # kg, liters, pieces
    low_stock_threshold = Column(Float, default=5.0)
    image_url = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime(timezone=True))
    is_completed = Column(Boolean, default=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    assigned_to = relationship("User", back_populates="tasks")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text)
    type = Column(String) # Yield, Expense, General
    created_at = Column(DateTime(timezone=True), server_default=func.now())
