from sqlmodel import SQLModel
from app.database import engine
from app import models

print("Initializing database and creating tables...")

SQLModel.metadata.create_all(engine)

print("✅ All tables created successfully.")
