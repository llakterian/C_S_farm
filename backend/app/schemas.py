from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import UserRole

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.FARMER

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Crop Schemas ---
class CropBase(BaseModel):
    name: str
    type: Optional[str] = None
    variety: Optional[str] = None
    planting_date: Optional[datetime] = None
    harvest_date_est: Optional[datetime] = None
    status: Optional[str] = "Planted"
    location: Optional[str] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None

class CropCreate(CropBase):
    pass

class Crop(CropBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Inventory Schemas ---
class InventoryBase(BaseModel):
    name: str
    category: Optional[str] = None
    quantity: float = 0.0
    unit: Optional[str] = None
    low_stock_threshold: float = 5.0
    image_url: Optional[str] = None

class InventoryCreate(InventoryBase):
    pass

class Inventory(InventoryBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Task Schemas ---
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: bool = False
    assigned_to_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
