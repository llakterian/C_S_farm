"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import date, datetime


# Staff Schemas
class StaffCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Staff member name")
    role: str = Field(..., min_length=1, max_length=50, description="Job role")
    pay_type: str = Field(..., description="Payment type: monthly or per_kilo")
    pay_rate: float = Field(..., gt=0, description="Payment rate (must be positive)")
    
    @validator('pay_type')
    def validate_pay_type(cls, v):
        if v not in ['monthly', 'per_kilo']:
            raise ValueError('pay_type must be either "monthly" or "per_kilo"')
        return v


# Tea Plucking Schemas
class TeaPluckingCreate(BaseModel):
    worker_id: int = Field(..., gt=0, description="Worker ID")
    quantity: float = Field(..., gt=0, description="Quantity in kg (must be positive)")
    date: Optional[datetime] = Field(None, description="Date of plucking")
    comment: Optional[str] = Field(None, max_length=500, description="Optional comment")


# Poultry Schemas
class FlockCreate(BaseModel):
    breed: str = Field(..., min_length=1, max_length=50, description="Chicken breed")
    date_added: Optional[date] = Field(None, description="Date added to farm")
    current_count: int = Field(0, ge=0, description="Current number of chickens")
    mortality: int = Field(0, ge=0, description="Number of deaths")
    housing_unit: Optional[str] = Field(None, max_length=50, description="Housing unit name")
    
    @validator('mortality')
    def validate_mortality(cls, v, values):
        if 'current_count' in values and v > values['current_count']:
            raise ValueError('Mortality cannot exceed current count')
        return v


class EggProductionCreate(BaseModel):
    flock_id: int = Field(..., gt=0, description="Flock ID")
    date_collected: Optional[date] = Field(None, description="Collection date")
    quantity: int = Field(..., ge=0, description="Number of eggs collected")
    broken: Optional[int] = Field(0, ge=0, description="Number of broken eggs")
    comments: Optional[str] = Field(None, max_length=500, description="Optional comments")
    
    @validator('broken')
    def validate_broken(cls, v, values):
        if 'quantity' in values and v > values['quantity']:
            raise ValueError('Broken eggs cannot exceed total quantity')
        return v


# Dairy Schemas
class CowCreate(BaseModel):
    tag_no: str = Field(..., min_length=1, max_length=20, description="Unique cow tag number")
    breed: Optional[str] = Field(None, max_length=50, description="Cow breed")
    lactation_no: int = Field(0, ge=0, description="Lactation number")
    age: Optional[int] = Field(None, ge=0, le=30, description="Age in years")
    status: str = Field("active", description="Status: active or inactive")
    
    @validator('status')
    def validate_status(cls, v):
        if v not in ['active', 'inactive']:
            raise ValueError('Status must be either "active" or "inactive"')
        return v


class MilkRecordCreate(BaseModel):
    cow_id: int = Field(..., gt=0, description="Cow ID")
    date_recorded: Optional[date] = Field(None, description="Recording date")
    quantity: float = Field(..., gt=0, description="Milk quantity in liters")
    notes: Optional[str] = Field(None, max_length=500, description="Optional notes")


# Dogs Schemas
class DogCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Dog name")
    breed: Optional[str] = Field(None, max_length=50, description="Dog breed")
    gender: Optional[str] = Field(None, description="Gender: male or female")
    dob: Optional[date] = Field(None, description="Date of birth")
    status: str = Field("on_farm", description="Status: on_farm, sold, or deceased")
    
    @validator('gender')
    def validate_gender(cls, v):
        if v and v not in ['male', 'female']:
            raise ValueError('Gender must be either "male" or "female"')
        return v
    
    @validator('status')
    def validate_status(cls, v):
        if v not in ['on_farm', 'sold', 'deceased']:
            raise ValueError('Status must be "on_farm", "sold", or "deceased"')
        return v


class LitterCreate(BaseModel):
    mother_id: int = Field(..., gt=0, description="Mother dog ID")
    father_id: Optional[int] = Field(None, gt=0, description="Father dog ID")
    date_of_birth: Optional[date] = Field(None, description="Litter birth date")
    puppies_count: int = Field(..., ge=0, description="Number of puppies")


# Inventory Schemas
class InventoryItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Item name")
    quantity: float = Field(0.0, ge=0, description="Item quantity")
    unit: Optional[str] = Field("kg", max_length=20, description="Unit of measurement")
    category: Optional[str] = Field(None, max_length=50, description="Item category")


# Finance Schemas
class TransactionCreate(BaseModel):
    date: Optional[datetime] = Field(None, description="Transaction date")
    category: Optional[str] = Field(None, max_length=50, description="Transaction category")
    description: Optional[str] = Field(None, max_length=200, description="Transaction description")
    amount: Optional[float] = Field(0.0, description="Transaction amount")
    unit: Optional[str] = Field(None, max_length=20, description="Currency/unit")


# Response Schemas
class SuccessResponse(BaseModel):
    ok: bool = True
    message: str = "Operation successful"


class ErrorResponse(BaseModel):
    detail: str
    error_type: Optional[str] = None
    field: Optional[str] = None
