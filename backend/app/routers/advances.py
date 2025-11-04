from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import WorkerAdvance, Staff
from datetime import datetime
from sqlalchemy import and_, func

router = APIRouter()

@router.get("/")
def list_advances(session: Session = Depends(get_session)):
    """List all worker advances"""
    advances = session.exec(select(WorkerAdvance)).all()
    
    detailed_advances = []
    for advance in advances:
        worker = session.get(Staff, advance.worker_id)
        detailed_advances.append({
            **advance.dict(),
            "worker_name": worker.name if worker else "Unknown"
        })
    
    return detailed_advances

@router.post("/")
def add_advance(advance: WorkerAdvance, session: Session = Depends(get_session)):
    """Record a new advance given to worker"""
    # Verify worker exists
    worker = session.get(Staff, advance.worker_id)
    if not worker:
        raise HTTPException(404, "Worker not found")
    
    # Set date if not provided
    if not advance.date:
        advance.date = datetime.now()
    
    session.add(advance)
    session.commit()
    session.refresh(advance)
    return advance

@router.get("/worker/{worker_id}")
def get_worker_advances(worker_id: int, session: Session = Depends(get_session)):
    """Get all advances for a specific worker"""
    advances = session.exec(
        select(WorkerAdvance).where(WorkerAdvance.worker_id == worker_id)
    ).all()
    return advances

@router.get("/month/{month}/{year}")
def get_month_advances(month: int, year: int, session: Session = Depends(get_session)):
    """Get all advances for a specific month"""
    if month < 1 or month > 12:
        raise HTTPException(400, "Invalid month. Must be between 1 and 12")
    
    advances = session.exec(
        select(WorkerAdvance).where(
            and_(
                WorkerAdvance.month == month,
                WorkerAdvance.year == year
            )
        )
    ).all()
    
    detailed_advances = []
    for advance in advances:
        worker = session.get(Staff, advance.worker_id)
        detailed_advances.append({
            **advance.dict(),
            "worker_name": worker.name if worker else "Unknown"
        })
    
    return detailed_advances

@router.get("/pending")
def get_pending_advances(session: Session = Depends(get_session)):
    """Get all advances that haven't been deducted yet"""
    advances = session.exec(
        select(WorkerAdvance).where(WorkerAdvance.deducted == False)
    ).all()
    
    detailed_advances = []
    for advance in advances:
        worker = session.get(Staff, advance.worker_id)
        detailed_advances.append({
            **advance.dict(),
            "worker_name": worker.name if worker else "Unknown"
        })
    
    return detailed_advances

@router.put("/{advance_id}")
def update_advance(
    advance_id: int,
    updated_advance: WorkerAdvance,
    session: Session = Depends(get_session)
):
    """Update an advance record"""
    advance = session.get(WorkerAdvance, advance_id)
    if not advance:
        raise HTTPException(404, "Advance not found")
    
    advance.worker_id = updated_advance.worker_id
    advance.amount = updated_advance.amount
    advance.date = updated_advance.date
    advance.month = updated_advance.month
    advance.year = updated_advance.year
    advance.deducted = updated_advance.deducted
    advance.notes = updated_advance.notes
    
    session.add(advance)
    session.commit()
    session.refresh(advance)
    return advance

@router.put("/{advance_id}/mark-deducted")
def mark_advance_deducted(advance_id: int, session: Session = Depends(get_session)):
    """Mark an advance as deducted from payroll"""
    advance = session.get(WorkerAdvance, advance_id)
    if not advance:
        raise HTTPException(404, "Advance not found")
    
    advance.deducted = True
    
    session.add(advance)
    session.commit()
    session.refresh(advance)
    
    return advance

@router.delete("/{advance_id}")
def delete_advance(advance_id: int, session: Session = Depends(get_session)):
    """Delete an advance record"""
    advance = session.get(WorkerAdvance, advance_id)
    if not advance:
        raise HTTPException(404, "Advance not found")
    
    session.delete(advance)
    session.commit()
    return {"ok": True}

@router.get("/summary/{month}/{year}")
def get_advances_summary(month: int, year: int, session: Session = Depends(get_session)):
    """Get summary of advances for a specific month"""
    
    if month < 1 or month > 12:
        raise HTTPException(400, "Invalid month. Must be between 1 and 12")
    
    advances = session.exec(
        select(WorkerAdvance).where(
            and_(
                WorkerAdvance.month == month,
                WorkerAdvance.year == year
            )
        )
    ).all()
    
    total_amount = sum(a.amount for a in advances)
    pending_amount = sum(a.amount for a in advances if not a.deducted)
    deducted_amount = sum(a.amount for a in advances if a.deducted)
    
    return {
        "month": month,
        "year": year,
        "total_advances": len(advances),
        "total_amount": total_amount,
        "pending_amount": pending_amount,
        "deducted_amount": deducted_amount,
        "pending_count": sum(1 for a in advances if not a.deducted),
        "deducted_count": sum(1 for a in advances if a.deducted)
    }
