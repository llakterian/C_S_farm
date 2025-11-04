from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Flock, EggProduction

router = APIRouter()

# --- Flocks ---
@router.get("/flocks")
def list_flocks(session: Session = Depends(get_session)):
    return session.exec(select(Flock)).all()

@router.post("/flocks")
def add_flock(flock: Flock, session: Session = Depends(get_session)):
    session.add(flock)
    session.commit()
    session.refresh(flock)
    return flock

@router.get("/flocks/{flock_id}")
def get_flock(flock_id: int, session: Session = Depends(get_session)):
    flock = session.get(Flock, flock_id)
    if not flock:
        raise HTTPException(404, "Flock not found")
    return flock

@router.put("/flocks/{flock_id}")
def update_flock(flock_id: int, updated_flock: Flock, session: Session = Depends(get_session)):
    """Update a flock"""
    flock = session.get(Flock, flock_id)
    if not flock:
        raise HTTPException(404, "Flock not found")
    
    flock.breed = updated_flock.breed
    flock.date_added = updated_flock.date_added
    flock.current_count = updated_flock.current_count
    flock.mortality = updated_flock.mortality
    flock.housing_unit = updated_flock.housing_unit
    
    session.add(flock)
    session.commit()
    session.refresh(flock)
    return flock

@router.delete("/flocks/{flock_id}")
def delete_flock(flock_id: int, session: Session = Depends(get_session)):
    flock = session.get(Flock, flock_id)
    if not flock:
        raise HTTPException(404, "Flock not found")
    session.delete(flock)
    session.commit()
    return {"ok": True}

# --- Egg Production ---
@router.get("/eggs")
def list_egg_records(session: Session = Depends(get_session)):
    return session.exec(select(EggProduction)).all()

@router.post("/eggs")
def add_egg_record(record: EggProduction, session: Session = Depends(get_session)):
    session.add(record)
    session.commit()
    session.refresh(record)
    return record

@router.get("/eggs/{egg_id}")
def get_egg_record(egg_id: int, session: Session = Depends(get_session)):
    """Get a specific egg production record"""
    record = session.get(EggProduction, egg_id)
    if not record:
        raise HTTPException(404, "Egg production record not found")
    return record

@router.put("/eggs/{egg_id}")
def update_egg_record(egg_id: int, updated_record: EggProduction, session: Session = Depends(get_session)):
    """Update an egg production record"""
    record = session.get(EggProduction, egg_id)
    if not record:
        raise HTTPException(404, "Egg production record not found")
    
    record.flock_id = updated_record.flock_id
    record.date_collected = updated_record.date_collected
    record.quantity = updated_record.quantity
    record.broken = updated_record.broken
    record.comments = updated_record.comments
    
    session.add(record)
    session.commit()
    session.refresh(record)
    return record

@router.delete("/eggs/{egg_id}")
def delete_egg_record(egg_id: int, session: Session = Depends(get_session)):
    """Delete an egg production record"""
    record = session.get(EggProduction, egg_id)
    if not record:
        raise HTTPException(404, "Egg production record not found")
    
    session.delete(record)
    session.commit()
    return {"ok": True}
