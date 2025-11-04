from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Cow, MilkRecord

router = APIRouter()

# --- Cows ---
@router.get("/cows")
def list_cows(session: Session = Depends(get_session)):
    return session.exec(select(Cow)).all()

@router.post("/cows")
def add_cow(cow: Cow, session: Session = Depends(get_session)):
    session.add(cow)
    session.commit()
    session.refresh(cow)
    return cow

@router.get("/cows/{cow_id}")
def get_cow(cow_id: int, session: Session = Depends(get_session)):
    cow = session.get(Cow, cow_id)
    if not cow:
        raise HTTPException(404, "Cow not found")
    return cow

@router.put("/cows/{cow_id}")
def update_cow(cow_id: int, updated_cow: Cow, session: Session = Depends(get_session)):
    """Update a cow"""
    cow = session.get(Cow, cow_id)
    if not cow:
        raise HTTPException(404, "Cow not found")
    
    cow.tag_no = updated_cow.tag_no
    cow.breed = updated_cow.breed
    cow.lactation_no = updated_cow.lactation_no
    cow.age = updated_cow.age
    cow.status = updated_cow.status
    
    session.add(cow)
    session.commit()
    session.refresh(cow)
    return cow

@router.delete("/cows/{cow_id}")
def delete_cow(cow_id: int, session: Session = Depends(get_session)):
    cow = session.get(Cow, cow_id)
    if not cow:
        raise HTTPException(404, "Cow not found")
    session.delete(cow)
    session.commit()
    return {"ok": True}

# --- Milk Records ---
@router.get("/milk")
def list_milk_records(session: Session = Depends(get_session)):
    return session.exec(select(MilkRecord)).all()

@router.post("/milk")
def add_milk_record(record: MilkRecord, session: Session = Depends(get_session)):
    session.add(record)
    session.commit()
    session.refresh(record)
    return record

@router.get("/milk/{milk_id}")
def get_milk_record(milk_id: int, session: Session = Depends(get_session)):
    """Get a specific milk record"""
    record = session.get(MilkRecord, milk_id)
    if not record:
        raise HTTPException(404, "Milk record not found")
    return record

@router.put("/milk/{milk_id}")
def update_milk_record(milk_id: int, updated_record: MilkRecord, session: Session = Depends(get_session)):
    """Update a milk record"""
    record = session.get(MilkRecord, milk_id)
    if not record:
        raise HTTPException(404, "Milk record not found")
    
    record.cow_id = updated_record.cow_id
    record.date_recorded = updated_record.date_recorded
    record.quantity = updated_record.quantity
    record.notes = updated_record.notes
    
    session.add(record)
    session.commit()
    session.refresh(record)
    return record

@router.delete("/milk/{milk_id}")
def delete_milk_record(milk_id: int, session: Session = Depends(get_session)):
    """Delete a milk record"""
    record = session.get(MilkRecord, milk_id)
    if not record:
        raise HTTPException(404, "Milk record not found")
    
    session.delete(record)
    session.commit()
    return {"ok": True}
