from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models import InventoryItem
router = APIRouter(prefix="/inventory", tags=["inventory"])
@router.post("/items", response_model=InventoryItem)
def add_item(payload: InventoryItem, session: Session = Depends(get_session)):
    session.add(payload); session.commit(); session.refresh(payload); return payload
@router.get("/items")
def list_items(session: Session = Depends(get_session)):
    return session.exec(select(InventoryItem)).all()
