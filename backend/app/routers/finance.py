from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models import Transaction
router = APIRouter(prefix="/finance", tags=["finance"])
@router.post("/transactions", response_model=Transaction)
def add_tx(payload: Transaction, session: Session = Depends(get_session)):
    session.add(payload); session.commit(); session.refresh(payload); return payload
@router.get("/transactions")
def list_tx(session: Session = Depends(get_session)):
    return session.exec(select(Transaction)).all()
