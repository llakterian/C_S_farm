from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models import Staff, TeaPlucking
router = APIRouter(prefix="/staff", tags=["staff"])
@router.post("/", response_model=Staff)
def add_staff(payload: Staff, session: Session = Depends(get_session)):
    session.add(payload); session.commit(); session.refresh(payload); return payload
@router.get("/", response_model=list[Staff])
def list_staff(session: Session = Depends(get_session)):
    return session.exec(select(Staff)).all()
@router.post("/tea-pluck", response_model=TeaPlucking)
def add_pluck(payload: TeaPlucking, session: Session = Depends(get_session)):
    session.add(payload); session.commit(); session.refresh(payload); return payload
@router.get("/pluckings")
def list_pluckings(session: Session = Depends(get_session)):
    return session.exec(select(TeaPlucking)).all()
@router.get("/payroll/{year}/{month}")
def payroll(year: int, month: int, session: Session = Depends(get_session)):
    from sqlalchemy import func
    from datetime import date
    staff = session.exec(select(Staff)).all()
    results = []
    for s in staff:
        if s.pay_type == 'monthly':
            amt = s.pay_rate
        else:
            start = date(year, month, 1)
            if month == 12:
                end = date(year+1, 1, 1)
            else:
                end = date(year, month+1, 1)
            total = session.exec(select(func.sum(TeaPlucking.kilos_plucked)).where(TeaPlucking.staff_id==s.id).where(TeaPlucking.date >= start).where(TeaPlucking.date < end)).one()
            kilos = total[0] or 0
            amt = kilos * s.pay_rate
        results.append({ "id": s.id, "name": s.name, "role": s.role, "amount": amt })
    return results
