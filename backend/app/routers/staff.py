from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Staff

router = APIRouter()

@router.get("/")
def list_staff(session: Session = Depends(get_session)):
    """List all staff members"""
    return session.exec(select(Staff)).all()

@router.post("/")
def add_staff(staff: Staff, session: Session = Depends(get_session)):
    """Add a new staff member"""
    session.add(staff)
    session.commit()
    session.refresh(staff)
    return staff


@router.get("/{staff_id}")
def get_staff(staff_id: int, session: Session = Depends(get_session)):
    """Get a specific staff member"""
    staff = session.get(Staff, staff_id)
    if not staff:
        raise HTTPException(404, "Staff member not found")
    return staff

@router.put("/{staff_id}")
def update_staff(staff_id: int, updated_staff: Staff, session: Session = Depends(get_session)):
    """Update a staff member"""
    staff = session.get(Staff, staff_id)
    if not staff:
        raise HTTPException(404, "Staff member not found")
    
    for key, value in updated_staff.dict(exclude_unset=True).items():
        setattr(staff, key, value)
    
    session.add(staff)
    session.commit()
    session.refresh(staff)
    return staff


@router.delete("/{staff_id}")
def delete_staff(staff_id: int, session: Session = Depends(get_session)):
    """Delete a staff member"""
    staff = session.get(Staff, staff_id)
    if not staff:
        raise HTTPException(404, "Staff member not found")
    
    session.delete(staff)
    session.commit()
    return {"ok": True}
