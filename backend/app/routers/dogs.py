from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models import Dog, Litter
router = APIRouter(prefix="/dogs", tags=["dogs"])
@router.post("/", response_model=Dog)
def add_dog(payload: Dog, session: Session = Depends(get_session)):
    session.add(payload); session.commit(); session.refresh(payload); return payload
@router.get("/")
def list_dogs(session: Session = Depends(get_session)):
    return session.exec(select(Dog)).all()
@router.post("/litters", response_model=Litter)
def add_litter(payload: Litter, session: Session = Depends(get_session)):
    session.add(payload); session.commit(); session.refresh(payload); return payload
@router.get("/litters")
def list_litters(session: Session = Depends(get_session)):
    return session.exec(select(Litter)).all()
