from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models import Flock, EggProduction
router = APIRouter(prefix="/poultry", tags=["poultry"])
@router.post("/flocks", response_model=Flock)
def add_flock(payload: Flock, session: Session = Depends(get_session)):
    session.add(payload); session.commit(); session.refresh(payload); return payload
@router.get("/flocks")
def list_flocks(session: Session = Depends(get_session)):
    return session.exec(select(Flock)).all()
@router.post("/eggs", response_model=EggProduction)
def add_eggs(payload: EggProduction, session: Session = Depends(get_session)):
    session.add(payload); session.commit(); session.refresh(payload); return payload
@router.get("/eggs")
def list_eggs(session: Session = Depends(get_session)):
    return session.exec(select(EggProduction)).all()
