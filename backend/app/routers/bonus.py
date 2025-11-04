from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import BonusPayment, Factory
from datetime import datetime
from sqlalchemy import and_

router = APIRouter()

@router.get("/")
def list_bonus_payments(session: Session = Depends(get_session)):
    """List all bonus payments"""
    bonuses = session.exec(select(BonusPayment)).all()
    
    detailed_bonuses = []
    for bonus in bonuses:
        factory = session.get(Factory, bonus.factory_id)
        detailed_bonuses.append({
            **bonus.dict(),
            "factory_name": factory.name if factory else "Unknown"
        })
    
    return detailed_bonuses

@router.post("/")
def add_bonus_payment(bonus: BonusPayment, session: Session = Depends(get_session)):
    """Record a new bonus payment from a factory"""
    # Verify factory exists
    factory = session.get(Factory, bonus.factory_id)
    if not factory:
        raise HTTPException(404, "Factory not found")
    
    # Calculate net bonus
    bonus.net_bonus = bonus.amount - bonus.fertilizer_deductions
    
    # Set date if not provided
    if not bonus.date_received:
        bonus.date_received = datetime.now()
    
    session.add(bonus)
    session.commit()
    session.refresh(bonus)
    return bonus

@router.get("/factory/{factory_id}")
def get_factory_bonuses(factory_id: int, session: Session = Depends(get_session)):
    """Get all bonus payments from a specific factory"""
    bonuses = session.exec(
        select(BonusPayment).where(BonusPayment.factory_id == factory_id)
    ).all()
    return bonuses

@router.get("/period/{period}")
def get_bonuses_by_period(period: str, session: Session = Depends(get_session)):
    """Get all bonuses for a specific period (e.g., '2024-H1', '2024-H2')"""
    bonuses = session.exec(
        select(BonusPayment).where(BonusPayment.period == period)
    ).all()
    
    detailed_bonuses = []
    for bonus in bonuses:
        factory = session.get(Factory, bonus.factory_id)
        detailed_bonuses.append({
            **bonus.dict(),
            "factory_name": factory.name if factory else "Unknown"
        })
    
    return detailed_bonuses

@router.get("/year/{year}")
def get_bonuses_by_year(year: int, session: Session = Depends(get_session)):
    """Get all bonuses for a specific year"""
    # Get bonuses for both halves of the year
    h1_period = f"{year}-H1"
    h2_period = f"{year}-H2"
    
    bonuses = session.exec(
        select(BonusPayment).where(
            (BonusPayment.period == h1_period) | (BonusPayment.period == h2_period)
        )
    ).all()
    
    detailed_bonuses = []
    for bonus in bonuses:
        factory = session.get(Factory, bonus.factory_id)
        detailed_bonuses.append({
            **bonus.dict(),
            "factory_name": factory.name if factory else "Unknown"
        })
    
    return detailed_bonuses

@router.put("/{bonus_id}")
def update_bonus_payment(
    bonus_id: int,
    updated_bonus: BonusPayment,
    session: Session = Depends(get_session)
):
    """Update a bonus payment"""
    bonus = session.get(BonusPayment, bonus_id)
    if not bonus:
        raise HTTPException(404, "Bonus payment not found")
    
    # Verify factory exists
    factory = session.get(Factory, updated_bonus.factory_id)
    if not factory:
        raise HTTPException(404, "Factory not found")
    
    bonus.factory_id = updated_bonus.factory_id
    bonus.period = updated_bonus.period
    bonus.amount = updated_bonus.amount
    bonus.date_received = updated_bonus.date_received
    bonus.fertilizer_deductions = updated_bonus.fertilizer_deductions
    bonus.net_bonus = updated_bonus.amount - updated_bonus.fertilizer_deductions
    bonus.notes = updated_bonus.notes
    
    session.add(bonus)
    session.commit()
    session.refresh(bonus)
    return bonus

@router.delete("/{bonus_id}")
def delete_bonus_payment(bonus_id: int, session: Session = Depends(get_session)):
    """Delete a bonus payment"""
    bonus = session.get(BonusPayment, bonus_id)
    if not bonus:
        raise HTTPException(404, "Bonus payment not found")
    
    session.delete(bonus)
    session.commit()
    return {"ok": True}

@router.get("/summary")
def get_bonus_summary(session: Session = Depends(get_session)):
    """Get summary statistics for all bonus payments"""
    
    bonuses = session.exec(select(BonusPayment)).all()
    
    if not bonuses:
        return {
            "total_bonuses": 0,
            "total_amount": 0,
            "total_fertilizer_deductions": 0,
            "total_net_bonus": 0
        }
    
    total_amount = sum(b.amount for b in bonuses)
    total_fertilizer_deductions = sum(b.fertilizer_deductions for b in bonuses)
    total_net_bonus = sum(b.net_bonus for b in bonuses)
    
    return {
        "total_bonuses": len(bonuses),
        "total_amount": total_amount,
        "total_fertilizer_deductions": total_fertilizer_deductions,
        "total_net_bonus": total_net_bonus
    }

@router.get("/summary/factory/{factory_id}")
def get_factory_bonus_summary(factory_id: int, session: Session = Depends(get_session)):
    """Get bonus payment summary for a specific factory"""
    
    # Verify factory exists
    factory = session.get(Factory, factory_id)
    if not factory:
        raise HTTPException(404, "Factory not found")
    
    bonuses = session.exec(
        select(BonusPayment).where(BonusPayment.factory_id == factory_id)
    ).all()
    
    if not bonuses:
        return {
            "factory_id": factory_id,
            "factory_name": factory.name,
            "total_bonuses": 0,
            "total_amount": 0,
            "total_fertilizer_deductions": 0,
            "total_net_bonus": 0
        }
    
    total_amount = sum(b.amount for b in bonuses)
    total_fertilizer_deductions = sum(b.fertilizer_deductions for b in bonuses)
    total_net_bonus = sum(b.net_bonus for b in bonuses)
    
    return {
        "factory_id": factory_id,
        "factory_name": factory.name,
        "total_bonuses": len(bonuses),
        "total_amount": total_amount,
        "total_fertilizer_deductions": total_fertilizer_deductions,
        "total_net_bonus": total_net_bonus
    }

@router.get("/summary/period/{period}")
def get_period_bonus_summary(period: str, session: Session = Depends(get_session)):
    """Get bonus summary for a specific period"""
    
    bonuses = session.exec(
        select(BonusPayment).where(BonusPayment.period == period)
    ).all()
    
    if not bonuses:
        return {
            "period": period,
            "total_bonuses": 0,
            "total_amount": 0,
            "total_fertilizer_deductions": 0,
            "total_net_bonus": 0
        }
    
    total_amount = sum(b.amount for b in bonuses)
    total_fertilizer_deductions = sum(b.fertilizer_deductions for b in bonuses)
    total_net_bonus = sum(b.net_bonus for b in bonuses)
    
    return {
        "period": period,
        "total_bonuses": len(bonuses),
        "total_amount": total_amount,
        "total_fertilizer_deductions": total_fertilizer_deductions,
        "total_net_bonus": total_net_bonus,
        "factories": list(set(b.factory_id for b in bonuses))
    }
