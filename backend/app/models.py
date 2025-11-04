from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date, datetime



# --- Staff & Tea plucking ---
class Staff(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    role: str
    pay_type: str  # 'monthly' or 'per_kilo'
    pay_rate: float

class Factory(SQLModel, table=True):
    """Tea factories with their rates and details"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    rate_per_kg: float  # Base rate before transport deduction
    transport_deduction: float = 3.0  # KES 3 per kg
    location: Optional[str] = Field(default=None)
    contact: Optional[str] = Field(default=None)
    active: bool = True

class TeaPlucking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    worker_id: int = Field(foreign_key="staff.id")
    factory_id: Optional[int] = Field(default=None, foreign_key="factory.id")
    quantity: float  # in kg
    date: datetime
    comment: Optional[str] = Field(default=None)
    
    # Calculated fields (stored for historical accuracy)
    rate_per_kg: Optional[float] = Field(default=None)  # Rate at time of delivery
    transport_deduction: Optional[float] = Field(default=None)  # Deduction at time
    gross_amount: Optional[float] = Field(default=None)  # quantity * rate
    net_amount: Optional[float] = Field(default=None)  # gross - (quantity * transport_deduction)

class FertilizerTransaction(SQLModel, table=True):
    """Track fertilizer given by factories"""
    id: Optional[int] = Field(default=None, primary_key=True)
    factory_id: int = Field(foreign_key="factory.id")
    worker_id: Optional[int] = Field(default=None, foreign_key="staff.id")  # If for specific worker
    quantity: float  # in kg or bags
    unit: str = "bags"
    cost_per_unit: float
    total_cost: float
    date: datetime
    deduction_type: str = "monthly"  # "monthly", "annual_bonus", "immediate"
    status: str = "pending"  # "pending", "completed", "cancelled"
    notes: Optional[str] = Field(default=None)

class MonthlyPayroll(SQLModel, table=True):
    """Monthly salary records"""
    id: Optional[int] = Field(default=None, primary_key=True)
    worker_id: int = Field(foreign_key="staff.id")
    month: int  # 1-12
    year: int
    
    # Earnings
    total_kg_plucked: float = 0
    gross_earnings: float = 0  # Total before deductions
    
    # Deductions
    fertilizer_deduction: float = 0
    other_deductions: float = 0
    total_deductions: float = 0
    
    # Net pay
    net_pay: float = 0
    
    # Payment status
    paid: bool = False
    payment_date: Optional[datetime] = Field(default=None)
    notes: Optional[str] = Field(default=None)

# --- Poultry ---
class Flock(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    breed: str
    date_added: Optional[date] = Field(default=None)
    current_count: int = 0
    mortality: int = 0
    housing_unit: Optional[str] = Field(default=None)

class EggProduction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    flock_id: Optional[int] = Field(default=None, foreign_key="flock.id")
    date_collected: Optional[date] = Field(default=None)
    quantity: int
    broken: Optional[int] = Field(default=None)
    comments: Optional[str] = Field(default=None)

# --- Dairy ---
class Cow(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tag_no: str
    breed: Optional[str] = Field(default=None)
    lactation_no: int = 0
    age: Optional[int] = Field(default=None)
    status: str = "active"

class MilkRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cow_id: Optional[int] = Field(default=None, foreign_key="cow.id")
    date_recorded: Optional[date] = Field(default=None)
    quantity: float
    notes: Optional[str] = Field(default=None)



# --- Dogs / Kennel ---
class Dog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    breed: Optional[str] = Field(default=None)
    gender: Optional[str] = Field(default=None)
    dob: Optional[date] = Field(default=None)
    status: str = "on_farm"

class Litter(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    mother_id: int = Field(foreign_key="dog.id")
    father_id: Optional[int] = Field(default=None, foreign_key="dog.id")
    date_of_birth: Optional[date] = Field(default=None)
    puppies_count: int = 0

# --- Inventory ---
class InventoryItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    quantity: float = 0.0
    unit: Optional[str] = Field(default="kg")
    category: Optional[str] = Field(default=None)

# --- Finance / Transactions ---
class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: Optional[datetime] = Field(default=None)
    category: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)
    amount: Optional[float] = Field(default=0.0)
    unit: Optional[str] = Field(default=None)
