from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import AvocadoHarvest, AvocadoSale
from datetime import datetime

router = APIRouter()

# ==================== AVOCADO HARVEST ENDPOINTS ====================

@router.get("/harvest/")
def list_harvests(session: Session = Depends(get_session)):
    """List all avocado harvest records"""
    harvests = session.exec(select(AvocadoHarvest)).all()
    return harvests

@router.post("/harvest/")
def add_harvest(harvest: AvocadoHarvest, session: Session = Depends(get_session)):
    """Add a new avocado harvest record"""
    if not harvest.date:
        harvest.date = datetime.now()
    
    session.add(harvest)
    session.commit()
    session.refresh(harvest)
    return harvest

@router.get("/harvest/{harvest_id}")
def get_harvest(harvest_id: int, session: Session = Depends(get_session)):
    """Get a specific harvest record"""
    harvest = session.get(AvocadoHarvest, harvest_id)
    if not harvest:
        raise HTTPException(404, "Harvest record not found")
    return harvest

@router.put("/harvest/{harvest_id}")
def update_harvest(harvest_id: int, updated_harvest: AvocadoHarvest, session: Session = Depends(get_session)):
    """Update a harvest record"""
    harvest = session.get(AvocadoHarvest, harvest_id)
    if not harvest:
        raise HTTPException(404, "Harvest record not found")
    
    harvest.variety = updated_harvest.variety
    harvest.quantity_kg = updated_harvest.quantity_kg
    harvest.grade = updated_harvest.grade
    harvest.date = updated_harvest.date
    harvest.notes = updated_harvest.notes
    
    session.add(harvest)
    session.commit()
    session.refresh(harvest)
    return harvest

@router.delete("/harvest/{harvest_id}")
def delete_harvest(harvest_id: int, session: Session = Depends(get_session)):
    """Delete a harvest record"""
    harvest = session.get(AvocadoHarvest, harvest_id)
    if not harvest:
        raise HTTPException(404, "Harvest record not found")
    
    session.delete(harvest)
    session.commit()
    return {"ok": True}

# ==================== AVOCADO SALES ENDPOINTS ====================

@router.get("/sales/")
def list_sales(session: Session = Depends(get_session)):
    """List all avocado sales"""
    sales = session.exec(select(AvocadoSale)).all()
    
    detailed_sales = []
    for sale in sales:
        # Calculate total amount
        total_amount = sale.quantity_kg * sale.price_per_kg
        detailed_sales.append({
            **sale.dict(),
            "total_amount": total_amount
        })
    
    return detailed_sales

@router.post("/sales/")
def add_sale(sale: AvocadoSale, session: Session = Depends(get_session)):
    """Add a new avocado sale"""
    if not sale.date:
        sale.date = datetime.now()
    
    session.add(sale)
    session.commit()
    session.refresh(sale)
    return sale

@router.get("/sales/{sale_id}")
def get_sale(sale_id: int, session: Session = Depends(get_session)):
    """Get a specific sale"""
    sale = session.get(AvocadoSale, sale_id)
    if not sale:
        raise HTTPException(404, "Sale not found")
    return sale

@router.delete("/sales/{sale_id}")
def delete_sale(sale_id: int, session: Session = Depends(get_session)):
    """Delete a sale"""
    sale = session.get(AvocadoSale, sale_id)
    if not sale:
        raise HTTPException(404, "Sale not found")
    
    session.delete(sale)
    session.commit()
    return {"ok": True}

#==================== STATISTICS ENDPOINTS ====================

@router.get("/stats/")
def get_avocado_stats(session: Session = Depends(get_session)):
    """Get avocado farm statistics"""
    harvests = session.exec(select(AvocadoHarvest)).all()
    sales = session.exec(select(AvocadoSale)).all()
    
    total_harvested = sum(h.quantity_kg for h in harvests)
    total_sold = sum(s.quantity_kg for s in sales)
    total_revenue = sum(s.quantity_kg * s.price_per_kg for s in sales)
    
    hass_harvested = sum(h.quantity_kg for h in harvests if h.variety == 'hass')
    fuerte_harvested = sum(h.quantity_kg for h in harvests if h.variety == 'fuerte')
    
    avg_price = total_revenue / total_sold if total_sold > 0 else 0
    
    return {
        "total_trees": 40,  # As mentioned: over 40 grafted trees
        "total_harvested_kg": total_harvested,
        "total_sold_kg": total_sold,
        "unsold_kg": total_harvested - total_sold,
        "total_revenue": total_revenue,
        "average_price_per_kg": avg_price,
        "hass_harvested_kg": hass_harvested,
        "fuerte_harvested_kg": fuerte_harvested,
        "total_harvest_records": len(harvests),
        "total_sales_records": len(sales)
    }
