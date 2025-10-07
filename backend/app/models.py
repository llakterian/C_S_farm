from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date
# Staff
class Staff(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    role: str
    pay_type: str  # 'monthly' or 'per_kilo'
    pay_rate: float
# Tea plucking
class TeaPlucking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    staff_id: int
    date: Optional[date] = None
    kilos_plucked: float = 0.0
# Poultry
class Flock(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    breed: str
    date_added: Optional[date] = None
    current_count: int = 0
    mortality: int = 0
    housing_unit: Optional[str] = None
class EggProduction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    flock_id: int
    date: Optional[date] = None
    eggs_collected: int = 0
    broken_eggs: int = 0
# Dairy
class Cow(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tag_no: str
    breed: Optional[str] = None
    lactation_no: int = 0
    age: Optional[int] = None
    status: str = 'active'
class MilkRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cow_id: int
    date: Optional[date] = None
    liters_morning: float = 0.0
    liters_evening: float = 0.0
# Dogs
class Dog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    breed: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[date] = None
    status: str = 'on_farm'
class Litter(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    mother_id: int
    father_id: Optional[int] = None
    date_of_birth: Optional[date] = None
    puppies_count: int = 0
# Inventory & Finance
class InventoryItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    quantity: float = 0.0
    unit: Optional[str] = 'kg'
    category: Optional[str] = None
class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: Optional[date] = None
    category: Optional[str] = None
    description: Optional[str] = None
    amount: float = 0.0
    unit: Optional[str] = None
