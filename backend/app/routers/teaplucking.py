from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import TeaPlucking, Staff, Factory
from datetime import datetime
from sqlalchemy import func, and_

router = APIRouter()

@router.get("/")
def list_tea_records(session: Session = Depends(get_session)):
    """List all tea plucking records with factory and worker details"""
    records = session.exec(select(TeaPlucking)).all()
    
    detailed_records = []
    for record in records:
        worker = session.get(Staff, record.worker_id)
        factory = session.get(Factory, record.factory_id) if record.factory_id else None
        
        detailed_records.append({
            **record.dict(),
            "worker_name": worker.name if worker else "Unknown",
            "factory_name": factory.name if factory else "Not assigned"
        })
    
    return detailed_records

@router.post("/")
def add_tea_record(record: TeaPlucking, session: Session = Depends(get_session)):
    """Add a new tea plucking record with automatic payment calculation"""
    # Verify worker exists
    worker = session.get(Staff, record.worker_id)
    if not worker:
        raise HTTPException(404, "Worker not found")
    
    # Get factory and calculate amounts
    factory = None
    if record.factory_id:
        factory = session.get(Factory, record.factory_id)
        if not factory:
            raise HTTPException(404, "Factory not found")
        
        # Payment structure:
        # - Farm pays worker KES 8/kg
        # - Factory pays farm at their rate (e.g., KES 22/kg)
        # - Factory deducts KES 3/kg for transport
        record.worker_rate = 8.0
        record.factory_rate = factory.rate_per_kg
        record.transport_deduction = 3.0
        
        # Calculate all amounts
        record.worker_payment = record.quantity * 8.0
        record.factory_gross = record.quantity * factory.rate_per_kg
        record.factory_net_to_farm = record.factory_gross - (record.quantity * 3.0)
        record.farm_profit = record.factory_net_to_farm - record.worker_payment
    
    # Set current date if not provided
    if not record.date:
        record.date = datetime.now()
    
    session.add(record)
    session.commit()
    session.refresh(record)
    return record

@router.get("/{record_id}")
def get_tea_record(record_id: int, session: Session = Depends(get_session)):
    """Get a specific tea plucking record"""
    record = session.get(TeaPlucking, record_id)
    if not record:
        raise HTTPException(404, "Tea plucking record not found")
    return record

@router.put("/{record_id}")
def update_tea_record(record_id: int, updated_record: TeaPlucking, session: Session = Depends(get_session)):
    """Update a tea plucking record"""
    record = session.get(TeaPlucking, record_id)
    if not record:
        raise HTTPException(404, "Tea plucking record not found")
    
    # Update fields
    record.worker_id = updated_record.worker_id
    record.quantity = updated_record.quantity
    record.date = updated_record.date
    record.comment = updated_record.comment
    
    session.add(record)
    session.commit()
    session.refresh(record)
    return record

@router.delete("/{record_id}")
def delete_tea_record(record_id: int, session: Session = Depends(get_session)):
    """Delete a tea plucking record"""
    record = session.get(TeaPlucking, record_id)
    if not record:
        raise HTTPException(404, "Tea plucking record not found")
    
    session.delete(record)
    session.commit()
    return {"ok": True}

@router.get("/worker/{worker_id}")
def get_worker_tea_records(worker_id: int, session: Session = Depends(get_session)):
    """Get all tea plucking records for a specific worker"""
    statement = select(TeaPlucking).where(TeaPlucking.worker_id == worker_id)
    records = session.exec(statement).all()
    return records
