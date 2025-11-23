from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Inventory])
def read_inventory(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    items = db.query(models.InventoryItem).offset(skip).limit(limit).all()
    return items

@router.post("/", response_model=schemas.Inventory)
def create_inventory_item(
    *,
    db: Session = Depends(deps.get_db),
    item_in: schemas.InventoryCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    item = models.InventoryItem(**item_in.dict())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
