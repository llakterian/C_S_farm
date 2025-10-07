from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models import Cow, MilkRecord
router = APIRouter(prefix="/dairy", tags=["dairy"])
@router.post("/cows", response_model=Cow)
def add_cow(payload: Cow, session: Session = Depends(get_session)):
    session.add(payload); session.commit(); session.refresh(payload); return payload
@router.get("/cows")
def list_cows(session: Session = Depends(get_session)):
    return session.exec(select(Cow)).all()
@router.post("/milk", response_model=MilkRecord)
def add_milk(payload: MilkRecord, session: Session = Depends(get_session)):
    session.add(payload); session.commit(); session.refresh(payload); return payload
@router.get("/milk")
def list_milk(session: Session = Depends(get_session)):
    return session.exec(select(MilkRecord)).all()
