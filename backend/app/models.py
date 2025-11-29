from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

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

# SQLModel-based models for FastAPI compatibility
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Staff(SQLModel, table=True):
    __tablename__ = "staff"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    role: Optional[str] = None  # Manager, Worker, etc.
    pay_type: Optional[str] = None  # per_kilo, monthly, daily
    pay_rate: float = 0.0
    phone: Optional[str] = None
    active: bool = True
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class Factory(SQLModel, table=True):
    __tablename__ = "factories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    rate_per_kg: float = 0.0
    transport_deduction: float = 3.0
    location: Optional[str] = None
    contact: Optional[str] = None
    active: bool = True
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class WorkerAdvance(SQLModel, table=True):
    __tablename__ = "worker_advances"

    id: Optional[int] = Field(default=None, primary_key=True)
    worker_id: int = Field(foreign_key="staff.id")
    amount: float
    month: int
    year: int
    date: datetime
    deducted: bool = False
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class FertilizerPurchase(SQLModel, table=True):
    __tablename__ = "fertilizer_purchases"

    id: Optional[int] = Field(default=None, primary_key=True)
    factory_id: int = Field(foreign_key="factories.id")
    bags: int
    cost_per_bag: float = 2500.0
    total_cost: float
    payment_method: str  # tea_delivery, bonus_deduction
    date: datetime
    paid: bool = False
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class BonusPayment(SQLModel, table=True):
    __tablename__ = "bonus_payments"

    id: Optional[int] = Field(default=None, primary_key=True)
    factory_id: int = Field(foreign_key="factories.id")
    period: str  # H1, H2
    amount: float
    fertilizer_deductions: float = 0.0
    net_bonus: float
    date_received: datetime
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class TeaPlucking(SQLModel, table=True):
    __tablename__ = "tea_plucking"

    id: Optional[int] = Field(default=None, primary_key=True)
    worker_id: int = Field(foreign_key="staff.id")
    factory_id: int = Field(foreign_key="factories.id")
    date: datetime
    quantity_kg: float
    rate_per_kg: float
    transport_deduction: float = 3.0
    gross_amount: float
    net_amount: float
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class MonthlyPayroll(SQLModel, table=True):
    __tablename__ = "monthly_payroll"

    id: Optional[int] = Field(default=None, primary_key=True)
    worker_id: int = Field(foreign_key="staff.id")
    month: int
    year: int
    total_kg: float = 0.0
    gross_earnings: float = 0.0
    total_advances: float = 0.0
    net_pay: float = 0.0
    paid: bool = False
    payment_date: Optional[datetime] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class AvocadoHarvest(SQLModel, table=True):
    __tablename__ = "avocado_harvests"

    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime
    variety: Optional[str] = None  # Hass, Fuerte
    quantity: float
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class AvocadoSale(SQLModel, table=True):
    __tablename__ = "avocado_sales"

    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime
    variety: Optional[str] = None  # Hass, Fuerte
    quantity: float
    price_per_kg: float
    total_amount: float
    buyer: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"

    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime
    type: str  # income, expense
    category: str
    amount: float
    description: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class Cow(SQLModel, table=True):
    __tablename__ = "cows"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    tag_number: Optional[str] = Field(default=None, unique=True)
    breed: Optional[str] = None
    birth_date: Optional[datetime] = None
    status: str = "active"  # active, sold, deceased
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class MilkRecord(SQLModel, table=True):
    __tablename__ = "milk_records"

    id: Optional[int] = Field(default=None, primary_key=True)
    cow_id: int = Field(foreign_key="cows.id")
    date: datetime
    quantity: float  # in liters
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class Flock(SQLModel, table=True):
    __tablename__ = "flocks"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    type: str  # layers, broilers
    count: int = 0
    acquisition_date: Optional[datetime] = None
    status: str = "active"
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class EggProduction(SQLModel, table=True):
    __tablename__ = "egg_production"

    id: Optional[int] = Field(default=None, primary_key=True)
    flock_id: int = Field(foreign_key="flocks.id")
    date: datetime
    quantity: int
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class Dog(SQLModel, table=True):
    __tablename__ = "dogs"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    breed: Optional[str] = None
    birth_date: Optional[datetime] = None
    gender: Optional[str] = None
    status: str = "active"
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class Litter(SQLModel, table=True):
    __tablename__ = "litters"

    id: Optional[int] = Field(default=None, primary_key=True)
    mother_id: int = Field(foreign_key="dogs.id")
    father_id: Optional[int] = Field(default=None, foreign_key="dogs.id")
    birth_date: datetime
    puppy_count: int
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
