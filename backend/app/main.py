from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import SQLModel
from app import models
from app.routers import staff, poultry, dairy, dogs, inventory, finance, teaplucking, factories, payroll, fertilizer

app = FastAPI(title="C_S Farm Management API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(staff.router, prefix="/staff", tags=["Staff"])
app.include_router(teaplucking.router, prefix="/teaplucking", tags=["Tea Plucking"])
app.include_router(factories.router, prefix="/factories", tags=["Factories"])
app.include_router(payroll.router, prefix="/payroll", tags=["Payroll"])
app.include_router(fertilizer.router, prefix="/fertilizer", tags=["Fertilizer"])
app.include_router(poultry.router, prefix="/poultry", tags=["Poultry"])
app.include_router(dairy.router, prefix="/dairy", tags=["Dairy"])
app.include_router(dogs.router, prefix="/dogs", tags=["Dogs"])
app.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
app.include_router(finance.router, prefix="/finance", tags=["Finance"])

@app.on_event("startup")
def on_startup():
    print("Initializing database...")
    SQLModel.metadata.create_all(engine)
    print("Database initialized.")

@app.get("/")
def root():
    return {"message": "Welcome to C_S Farm API"}
