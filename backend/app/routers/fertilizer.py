from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import FertilizerPurchase, Factory
from datetime import datetime
from sqlalchemy import and_

router = APIRouter()

@router.get("/")
def list_fertilizer_purchases(session: Session = Depends(get_session)):
    """List all fertilizer purchases from factories"""
    purchases = session.exec(select(FertilizerPurchase)).all()
    
    detailed_purchases = []
    for purchase in purchases:
        factory = session.get(Factory, purchase.factory_id)
        detailed_purchases.append({
            **purchase.dict(),
            "factory_name": factory.name if factory else "Unknown"
        })
    
    return detailed_purchases

@router.post("/")
def add_fertilizer_purchase(purchase: FertilizerPurchase, session: Session = Depends(get_session)):
    """Record a new fertilizer purchase from a factory"""
    # Verify factory exists
    factory = session.get(Factory, purchase.factory_id)
    if not factory:
        raise HTTPException(404, "Factory not found")
    
    # Set default cost per bag if not provided
    if not purchase.cost_per_bag:
        purchase.cost_per_bag = 2500.0
    
    # Calculate total cost
    purchase.total_cost = purchase.bags * purchase.cost_per_bag
    
    # Set date if not provided
    if not purchase.date:
        purchase.date = datetime.now()
    
    # Validate payment method
    if purchase.payment_method not in ["tea_delivery", "bonus_deduction"]:
        raise HTTPException(400, "Invalid payment method. Must be 'tea_delivery' or 'bonus_deduction'")
    
    session.add(purchase)
    session.commit()
    session.refresh(purchase)
    return purchase

@router.get("/factory/{factory_id}")
def get_factory_fertilizer_purchases(factory_id: int, session: Session = Depends(get_session)):
    """Get all fertilizer purchases from a specific factory"""
    purchases = session.exec(
        select(FertilizerPurchase).where(FertilizerPurchase.factory_id == factory_id)
    ).all()
    return purchases

@router.get("/unpaid")
def get_unpaid_purchases(session: Session = Depends(get_session)):
    """Get all unpaid fertilizer purchases"""
    purchases = session.exec(
        select(FertilizerPurchase).where(FertilizerPurchase.paid == False)
    ).all()
    
    detailed_purchases = []
    for purchase in purchases:
        factory = session.get(Factory, purchase.factory_id)
        detailed_purchases.append({
            **purchase.dict(),
            "factory_name": factory.name if factory else "Unknown"
        })
    
    return detailed_purchases

@router.get("/payment-method/{method}")
def get_purchases_by_payment_method(method: str, session: Session = Depends(get_session)):
    """Get all purchases by payment method"""
    if method not in ["tea_delivery", "bonus_deduction"]:
        raise HTTPException(400, "Invalid payment method")
    
    purchases = session.exec(
        select(FertilizerPurchase).where(FertilizerPurchase.payment_method == method)
    ).all()
    
    detailed_purchases = []
    for purchase in purchases:
        factory = session.get(Factory, purchase.factory_id)
        detailed_purchases.append({
            **purchase.dict(),
            "factory_name": factory.name if factory else "Unknown"
        })
    
    return detailed_purchases

@router.put("/{purchase_id}")
def update_fertilizer_purchase(
    purchase_id: int,
    updated_purchase: FertilizerPurchase,
    session: Session = Depends(get_session)
):
    """Update a fertilizer purchase"""
    purchase = session.get(FertilizerPurchase, purchase_id)
    if not purchase:
        raise HTTPException(404, "Fertilizer purchase not found")
    
    # Verify factory exists
    factory = session.get(Factory, updated_purchase.factory_id)
    if not factory:
        raise HTTPException(404, "Factory not found")
    
    # Validate payment method
    if updated_purchase.payment_method not in ["tea_delivery", "bonus_deduction"]:
        raise HTTPException(400, "Invalid payment method")
    
    purchase.factory_id = updated_purchase.factory_id
    purchase.bags = updated_purchase.bags
    purchase.cost_per_bag = updated_purchase.cost_per_bag
    purchase.total_cost = updated_purchase.bags * updated_purchase.cost_per_bag
    purchase.date = updated_purchase.date
    purchase.payment_method = updated_purchase.payment_method
    purchase.paid = updated_purchase.paid
    purchase.payment_date = updated_purchase.payment_date
    purchase.notes = updated_purchase.notes
    
    session.add(purchase)
    session.commit()
    session.refresh(purchase)
    return purchase

@router.put("/{purchase_id}/mark-paid")
def mark_purchase_paid(purchase_id: int, session: Session = Depends(get_session)):
    """Mark a fertilizer purchase as paid"""
    purchase = session.get(FertilizerPurchase, purchase_id)
    if not purchase:
        raise HTTPException(404, "Fertilizer purchase not found")
    
    purchase.paid = True
    purchase.payment_date = datetime.now()
    
    session.add(purchase)
    session.commit()
    session.refresh(purchase)
    
    return purchase

@router.delete("/{purchase_id}")
def delete_fertilizer_purchase(purchase_id: int, session: Session = Depends(get_session)):
    """Delete a fertilizer purchase"""
    purchase = session.get(FertilizerPurchase, purchase_id)
    if not purchase:
        raise HTTPException(404, "Fertilizer purchase not found")
    
    session.delete(purchase)
    session.commit()
    return {"ok": True}

@router.get("/summary")
def get_fertilizer_summary(session: Session = Depends(get_session)):
    """Get summary statistics for all fertilizer purchases"""
    
    purchases = session.exec(select(FertilizerPurchase)).all()
    
    if not purchases:
        return {
            "total_purchases": 0,
            "total_bags": 0,
            "total_cost": 0,
            "unpaid_amount": 0,
            "paid_amount": 0,
            "tea_delivery_amount": 0,
            "bonus_deduction_amount": 0
        }
    
    total_bags = sum(p.bags for p in purchases)
    total_cost = sum(p.total_cost for p in purchases)
    unpaid_amount = sum(p.total_cost for p in purchases if not p.paid)
    paid_amount = sum(p.total_cost for p in purchases if p.paid)
    
    tea_delivery_purchases = [p for p in purchases if p.payment_method == "tea_delivery"]
    bonus_deduction_purchases = [p for p in purchases if p.payment_method == "bonus_deduction"]
    
    tea_delivery_amount = sum(p.total_cost for p in tea_delivery_purchases)
    bonus_deduction_amount = sum(p.total_cost for p in bonus_deduction_purchases)
    
    return {
        "total_purchases": len(purchases),
        "total_bags": total_bags,
        "total_cost": total_cost,
        "unpaid_amount": unpaid_amount,
        "paid_amount": paid_amount,
        "tea_delivery_amount": tea_delivery_amount,
        "bonus_deduction_amount": bonus_deduction_amount,
        "unpaid_count": sum(1 for p in purchases if not p.paid),
        "paid_count": sum(1 for p in purchases if p.paid)
    }

@router.get("/summary/factory/{factory_id}")
def get_factory_fertilizer_summary(factory_id: int, session: Session = Depends(get_session)):
    """Get fertilizer purchase summary for a specific factory"""
    
    # Verify factory exists
    factory = session.get(Factory, factory_id)
    if not factory:
        raise HTTPException(404, "Factory not found")
    
    purchases = session.exec(
        select(FertilizerPurchase).where(FertilizerPurchase.factory_id == factory_id)
    ).all()
    
    if not purchases:
        return {
            "factory_id": factory_id,
            "factory_name": factory.name,
            "total_purchases": 0,
            "total_bags": 0,
            "total_cost": 0,
            "unpaid_amount": 0,
            "paid_amount": 0
        }
    
    total_bags = sum(p.bags for p in purchases)
    total_cost = sum(p.total_cost for p in purchases)
    unpaid_amount = sum(p.total_cost for p in purchases if not p.paid)
    paid_amount = sum(p.total_cost for p in purchases if p.paid)
    
    return {
        "factory_id": factory_id,
        "factory_name": factory.name,
        "total_purchases": len(purchases),
        "total_bags": total_bags,
        "total_cost": total_cost,
        "unpaid_amount": unpaid_amount,
        "paid_amount": paid_amount,
        "unpaid_count": sum(1 for p in purchases if not p.paid),
        "paid_count": sum(1 for p in purchases if p.paid)
    }
