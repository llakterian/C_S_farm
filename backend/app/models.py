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
    
    # Payment tracking (stored for historical accuracy)
    worker_rate: float = 8.0  # KES 8/kg - what farm pays worker
    factory_rate: Optional[float] = Field(default=None)  # Factory's rate per kg (e.g., KES 22)
    transport_deduction: float = 3.0  # KES 3/kg deducted by factory
    
    # Calculated amounts
    worker_payment: Optional[float] = Field(default=None)  # quantity * 8
    factory_gross: Optional[float] = Field(default=None)  # quantity * factory_rate
    factory_net_to_farm: Optional[float] = Field(default=None)  # factory_gross - (quantity * 3)
    farm_profit: Optional[float] = Field(default=None)  # factory_net_to_farm - worker_payment

class WorkerAdvance(SQLModel, table=True):
    """Track money advances given to workers (deducted from monthly pay)"""
    id: Optional[int] = Field(default=None, primary_key=True)
    worker_id: int = Field(foreign_key="staff.id")
    amount: float  # Amount advanced in KES
    date: datetime
    month: int  # Month to deduct from (1-12)
    year: int
    deducted: bool = False  # Whether it's been deducted from payroll
    notes: Optional[str] = Field(default=None)

class FertilizerPurchase(SQLModel, table=True):
    """Track fertilizer purchases from factories (farm pays factories)"""
    id: Optional[int] = Field(default=None, primary_key=True)
    factory_id: int = Field(foreign_key="factory.id")
    bags: int  # Number of bags purchased
    cost_per_bag: float = 2500.0  # KES 2,500 per bag
    total_cost: float  # bags * cost_per_bag
    date: datetime
    payment_method: str = "tea_delivery"  # "tea_delivery" or "bonus_deduction"
    paid: bool = False
    payment_date: Optional[datetime] = Field(default=None)
    notes: Optional[str] = Field(default=None)

class BonusPayment(SQLModel, table=True):
    """Track biannual bonus payments from factories"""
    id: Optional[int] = Field(default=None, primary_key=True)
    factory_id: int = Field(foreign_key="factory.id")
    period: str  # e.g., "2024-H1", "2024-H2"
    amount: float  # Total bonus amount in KES
    date_received: datetime
    fertilizer_deductions: float = 0.0  # Fertilizer costs deducted from bonus
    net_bonus: float  # amount - fertilizer_deductions
    notes: Optional[str] = Field(default=None)

class MonthlyPayroll(SQLModel, table=True):
    """Monthly salary records for tea pluckers"""
    id: Optional[int] = Field(default=None, primary_key=True)
    worker_id: int = Field(foreign_key="staff.id")
    month: int  # 1-12
    year: int
    
    # Earnings
    total_kg: float = 0  # Total kg plucked in month
    gross_earnings: float = 0  # Total earnings before deductions
    
    # Deductions (Advances given during the month)
    total_advances: float = 0  # Sum of all advances given in this month
    
    # Net pay
    net_pay: float = 0  # gross_earnings - total_advances
    
    # Payment tracking
    paid: bool = False
    payment_date: Optional[datetime] = Field(default=None)
    created_at: Optional[datetime] = Field(default=None)
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

# --- Avocado Farm Management ---
class AvocadoHarvest(SQLModel, table=True):
    """Track avocado harvests from the 40+ grafted trees"""
    id: Optional[int] = Field(default=None, primary_key=True)
    variety: str = "hass"  # "hass" or "fuerte"
    quantity_kg: float  # Weight in kg
    grade: Optional[str] = Field(default="A")  # Quality grade: A, B, C
    date: datetime
    notes: Optional[str] = Field(default=None)

class AvocadoSale(SQLModel, table=True):
    """Track avocado sales"""
    id: Optional[int] = Field(default=None, primary_key=True)
    quantity_kg: float  # Weight sold
    price_per_kg: float  # Current: KES 20, Future: KES 35-40
    buyer_name: Optional[str] = Field(default=None)
    date: datetime
    payment_status: str = "pending"  # "pending", "paid", "partial"
    notes: Optional[str] = Field(default=None)
