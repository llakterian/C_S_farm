from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import MonthlyPayroll, TeaPlucking, Staff, FertilizerTransaction, Factory
from typing import List
from datetime import datetime
from sqlalchemy import func, and_

router = APIRouter()

@router.get("/")
def list_payrolls(session: Session = Depends(get_session)):
    """List all payroll records"""
    return session.exec(select(MonthlyPayroll)).all()

@router.get("/calculate/{month}/{year}")
def calculate_monthly_payroll(month: int, year: int, session: Session = Depends(get_session)):
    """Calculate payroll for all workers for a specific month"""
    
    if month < 1 or month > 12:
        raise HTTPException(400, "Invalid month. Must be between 1 and 12")
    
    # Get all tea plucking workers
    workers = session.exec(
        select(Staff).where(Staff.pay_type == "per_kilo")
    ).all()
    
    payroll_records = []
    
    for worker in workers:
        # Check if payroll already exists
        existing = session.exec(
            select(MonthlyPayroll).where(
                and_(
                    MonthlyPayroll.worker_id == worker.id,
                    MonthlyPayroll.month == month,
                    MonthlyPayroll.year == year
                )
            )
        ).first()
        
        if existing:
            continue  # Skip if already calculated
        
        # Get all tea plucking records for this worker in this month
        tea_records = session.exec(
            select(TeaPlucking).where(
                and_(
                    TeaPlucking.worker_id == worker.id,
                    func.extract('month', TeaPlucking.date) == month,
                    func.extract('year', TeaPlucking.date) == year
                )
            )
        ).all()
        
        # Calculate totals
        total_kg = sum(record.quantity for record in tea_records)
        gross_earnings = sum(record.net_amount or 0 for record in tea_records)
        
        # Get fertilizer deductions for this worker this month
        fertilizer_deductions = session.exec(
            select(FertilizerTransaction).where(
                and_(
                    FertilizerTransaction.worker_id == worker.id,
                    FertilizerTransaction.status == "pending",
                    FertilizerTransaction.deduction_type == "monthly"
                )
            )
        ).all()
        
        fertilizer_total = sum(f.total_cost for f in fertilizer_deductions)
        
        # Calculate net pay
        total_deductions = fertilizer_total
        net_pay = gross_earnings - total_deductions
        
        # Create payroll record
        payroll = MonthlyPayroll(
            worker_id=worker.id,
            month=month,
            year=year,
            total_kg_plucked=total_kg,
            gross_earnings=gross_earnings,
            fertilizer_deduction=fertilizer_total,
            other_deductions=0,
            total_deductions=total_deductions,
            net_pay=net_pay,
            paid=False
        )
        
        session.add(payroll)
        payroll_records.append(payroll)
    
    session.commit()
    
    return {
        "ok": True,
        "month": month,
        "year": year,
        "workers_processed": len(payroll_records),
        "payrolls": payroll_records
    }

@router.get("/worker/{worker_id}")
def get_worker_payrolls(worker_id: int, session: Session = Depends(get_session)):
    """Get all payroll records for a specific worker"""
    payrolls = session.exec(
        select(MonthlyPayroll).where(MonthlyPayroll.worker_id == worker_id)
    ).all()
    return payrolls

@router.get("/month/{month}/{year}")
def get_month_payrolls(month: int, year: int, session: Session = Depends(get_session)):
    """Get all payroll records for a specific month"""
    payrolls = session.exec(
        select(MonthlyPayroll).where(
            and_(
                MonthlyPayroll.month == month,
                MonthlyPayroll.year == year
            )
        )
    ).all()
    
    # Get worker details
    detailed_payrolls = []
    for payroll in payrolls:
        worker = session.get(Staff, payroll.worker_id)
        detailed_payrolls.append({
            **payroll.dict(),
            "worker_name": worker.name if worker else "Unknown",
            "worker_role": worker.role if worker else "Unknown"
        })
    
    return detailed_payrolls

@router.put("/{payroll_id}/mark-paid")
def mark_payroll_paid(payroll_id: int, session: Session = Depends(get_session)):
    """Mark a payroll as paid"""
    payroll = session.get(MonthlyPayroll, payroll_id)
    if not payroll:
        raise HTTPException(404, "Payroll record not found")
    
    payroll.paid = True
    payroll.payment_date = datetime.now()
    
    session.add(payroll)
    session.commit()
    session.refresh(payroll)
    
    return payroll

@router.get("/summary/{month}/{year}")
def get_payroll_summary(month: int, year: int, session: Session = Depends(get_session)):
    """Get summary statistics for monthly payroll"""
    
    payrolls = session.exec(
        select(MonthlyPayroll).where(
            and_(
                MonthlyPayroll.month == month,
                MonthlyPayroll.year == year
            )
        )
    ).all()
    
    if not payrolls:
        return {
            "month": month,
            "year": year,
            "total_workers": 0,
            "total_kg_plucked": 0,
            "total_gross_earnings": 0,
            "total_deductions": 0,
            "total_net_pay": 0,
            "workers_paid": 0,
            "workers_unpaid": 0
        }
    
    return {
        "month": month,
        "year": year,
        "total_workers": len(payrolls),
        "total_kg_plucked": sum(p.total_kg_plucked for p in payrolls),
        "total_gross_earnings": sum(p.gross_earnings for p in payrolls),
        "total_deductions": sum(p.total_deductions for p in payrolls),
        "total_net_pay": sum(p.net_pay for p in payrolls),
        "workers_paid": sum(1 for p in payrolls if p.paid),
        "workers_unpaid": sum(1 for p in payrolls if not p.paid)
    }
