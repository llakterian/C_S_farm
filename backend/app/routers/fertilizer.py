from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import FertilizerTransaction, Factory, Staff
from datetime import datetime
from sqlalchemy import and_

router = APIRouter()

@router.get("/")
def list_fertilizer_transactions(session: Session = Depends(get_session)):
    """List all fertilizer transactions"""
    transactions = session.exec(select(FertilizerTransaction)).all()
    
    detailed_transactions = []
    for trans in transactions:
        factory = session.get(Factory, trans.factory_id)
        worker = session.get(Staff, trans.worker_id) if trans.worker_id else None
        
        detailed_transactions.append({
            **trans.dict(),
            "factory_name": factory.name if factory else "Unknown",
            "worker_name": worker.name if worker else "General"
        })
    
    return detailed_transactions

@router.post("/")
def add_fertilizer_transaction(transaction: FertilizerTransaction, session: Session = Depends(get_session)):
    """Add a new fertilizer transaction"""
    # Verify factory exists
    factory = session.get(Factory, transaction.factory_id)
    if not factory:
        raise HTTPException(404, "Factory not found")
    
    # Verify worker exists if worker_id provided
    if transaction.worker_id:
        worker = session.get(Staff, transaction.worker_id)
        if not worker:
            raise HTTPException(404, "Worker not found")
    
    # Calculate total cost
    transaction.total_cost = transaction.quantity * transaction.cost_per_unit
    
    # Set date if not provided
    if not transaction.date:
        transaction.date = datetime.now()
    
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return transaction

@router.get("/{transaction_id}")
def get_fertilizer_transaction(transaction_id: int, session: Session = Depends(get_session)):
    """Get a specific fertilizer transaction"""
    transaction = session.get(FertilizerTransaction, transaction_id)
    if not transaction:
        raise HTTPException(404, "Fertilizer transaction not found")
    return transaction

@router.put("/{transaction_id}")
def update_fertilizer_transaction(
    transaction_id: int, 
    updated_transaction: FertilizerTransaction, 
    session: Session = Depends(get_session)
):
    """Update a fertilizer transaction"""
    transaction = session.get(FertilizerTransaction, transaction_id)
    if not transaction:
        raise HTTPException(404, "Fertilizer transaction not found")
    
    transaction.factory_id = updated_transaction.factory_id
    transaction.worker_id = updated_transaction.worker_id
    transaction.quantity = updated_transaction.quantity
    transaction.unit = updated_transaction.unit
    transaction.cost_per_unit = updated_transaction.cost_per_unit
    transaction.total_cost = updated_transaction.quantity * updated_transaction.cost_per_unit
    transaction.date = updated_transaction.date
    transaction.deduction_type = updated_transaction.deduction_type
    transaction.status = updated_transaction.status
    transaction.notes = updated_transaction.notes
    
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return transaction

@router.delete("/{transaction_id}")
def delete_fertilizer_transaction(transaction_id: int, session: Session = Depends(get_session)):
    """Delete a fertilizer transaction"""
    transaction = session.get(FertilizerTransaction, transaction_id)
    if not transaction:
        raise HTTPException(404, "Fertilizer transaction not found")
    
    session.delete(transaction)
    session.commit()
    return {"ok": True}

@router.get("/worker/{worker_id}")
def get_worker_fertilizer(worker_id: int, session: Session = Depends(get_session)):
    """Get all fertilizer transactions for a specific worker"""
    transactions = session.exec(
        select(FertilizerTransaction).where(FertilizerTransaction.worker_id == worker_id)
    ).all()
    return transactions

@router.get("/factory/{factory_id}")
def get_factory_fertilizer(factory_id: int, session: Session = Depends(get_session)):
    """Get all fertilizer transactions from a specific factory"""
    transactions = session.exec(
        select(FertilizerTransaction).where(FertilizerTransaction.factory_id == factory_id)
    ).all()
    return transactions

@router.put("/{transaction_id}/mark-completed")
def mark_fertilizer_completed(transaction_id: int, session: Session = Depends(get_session)):
    """Mark a fertilizer transaction as completed (deducted)"""
    transaction = session.get(FertilizerTransaction, transaction_id)
    if not transaction:
        raise HTTPException(404, "Fertilizer transaction not found")
    
    transaction.status = "completed"
    
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    
    return transaction
