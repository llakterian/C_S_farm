from fastapi import FastAPI
from app.database import init_db
from app.routers import staff, poultry, dairy, dogs, inventory, finance
app = FastAPI(title='C. SAMBU FARM MANAGEMENT API')
@app.on_event('startup')
def startup():
    init_db()
app.include_router(staff.router)
app.include_router(poultry.router)
app.include_router(dairy.router)
app.include_router(dogs.router)
app.include_router(inventory.router)
app.include_router(finance.router)
@app.get('/')
def root():
    return {'message': 'C. SAMBU FARM API running'}
