from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, crops, tasks, inventory
from app.routers import staff, factories, teaplucking, advances, fertilizer, bonus, payroll
from app.database import engine, Base

# Create tables on startup (for now, until we use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Default to allow all for dev
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(crops.router, prefix=f"{settings.API_V1_STR}/crops", tags=["crops"])
app.include_router(tasks.router, prefix=f"{settings.API_V1_STR}/tasks", tags=["tasks"])
app.include_router(inventory.router, prefix=f"{settings.API_V1_STR}/inventory", tags=["inventory"])

# New routers
app.include_router(staff.router, prefix=f"{settings.API_V1_STR}/staff", tags=["staff"])
app.include_router(factories.router, prefix=f"{settings.API_V1_STR}/factories", tags=["factories"])
app.include_router(teaplucking.router, prefix=f"{settings.API_V1_STR}/teaplucking", tags=["teaplucking"])
app.include_router(advances.router, prefix=f"{settings.API_V1_STR}/advances", tags=["advances"])
app.include_router(fertilizer.router, prefix=f"{settings.API_V1_STR}/fertilizer", tags=["fertilizer"])
app.include_router(bonus.router, prefix=f"{settings.API_V1_STR}/bonus", tags=["bonus"])
app.include_router(payroll.router, prefix=f"{settings.API_V1_STR}/payroll", tags=["payroll"])

@app.get("/")
def root():
    return {"message": "Welcome to C. Sambu Farm Manager API"}
