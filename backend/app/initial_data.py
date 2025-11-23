import logging
from app.database import SessionLocal, engine, Base
from app.models import User, UserRole
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@farm.com").first()
        if not user:
            logger.info("Creating default admin user...")
            user = User(
                email="admin@farm.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Farm Admin",
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(user)
            db.commit()
            logger.info("Default admin user created.")
        else:
            logger.info("Default admin user already exists.")
    except Exception as e:
        logger.error(f"Error initializing DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Creating initial data")
    init_db()
    logger.info("Initial data created")
