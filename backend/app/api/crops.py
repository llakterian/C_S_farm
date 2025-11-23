from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Crop])
def read_crops(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    crops = db.query(models.Crop).offset(skip).limit(limit).all()
    return crops

@router.post("/", response_model=schemas.Crop)
def create_crop(
    *,
    db: Session = Depends(deps.get_db),
    crop_in: schemas.CropCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    crop = models.Crop(**crop_in.dict())
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop

@router.get("/{crop_id}", response_model=schemas.Crop)
def read_crop(
    *,
    db: Session = Depends(deps.get_db),
    crop_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop

@router.delete("/{crop_id}", response_model=schemas.Crop)
def delete_crop(
    *,
    db: Session = Depends(deps.get_db),
    crop_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    db.delete(crop)
    db.commit()
    return crop
