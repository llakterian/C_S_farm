from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Transaction

router = APIRouter()

@router.get("/")
def list_transactions(session: Session = Depends(get_session)):
    return session.exec(select(Transaction)).all()

@router.post("/")
def add_transaction(transaction: Transaction, session: Session = Depends(get_session)):
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return transaction

@router.get("/{transaction_id}")
def get_transaction(transaction_id: int, session: Session = Depends(get_session)):
    txn = session.get(Transaction, transaction_id)
    if not txn:
        raise HTTPException(404, "Transaction not found")
    return txn

@router.put("/{transaction_id}")
def update_transaction(transaction_id: int, updated_transaction: Transaction, session: Session = Depends(get_session)):
    """Update a transaction"""
    txn = session.get(Transaction, transaction_id)
    if not txn:
        raise HTTPException(404, "Transaction not found")
    
    txn.date = updated_transaction.date
    txn.category = updated_transaction.category
    txn.description = updated_transaction.description
    txn.amount = updated_transaction.amount
    txn.unit = updated_transaction.unit
    
    session.add(txn)
    session.commit()
    session.refresh(txn)
    return txn

@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: int, session: Session = Depends(get_session)):
    txn = session.get(Transaction, transaction_id)
    if not txn:
        raise HTTPException(404, "Transaction not found")
    session.delete(txn)
    session.commit()
    return {"ok": True}
