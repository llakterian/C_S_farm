from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import InventoryItem

router = APIRouter()

@router.get("/")
def list_items(session: Session = Depends(get_session)):
    return session.exec(select(InventoryItem)).all()

@router.post("/")
def add_item(item: InventoryItem, session: Session = Depends(get_session)):
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@router.get("/{item_id}")
def get_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    return item

@router.put("/{item_id}")
def update_item(item_id: int, updated_item: InventoryItem, session: Session = Depends(get_session)):
    """Update an inventory item"""
    item = session.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    
    item.name = updated_item.name
    item.quantity = updated_item.quantity
    item.unit = updated_item.unit
    item.category = updated_item.category
    
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    session.delete(item)
    session.commit()
    return {"ok": True}
