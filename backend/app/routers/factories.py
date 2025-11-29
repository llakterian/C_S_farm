from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Factory
from typing import List

router = APIRouter()

@router.get("/")
def list_factories(session: Session = Depends(get_session)):
    """List all tea factories"""
    return session.exec(select(Factory)).all()

@router.post("/")
def add_factory(factory_data: dict, session: Session = Depends(get_session)):
    """Add a new tea factory"""
    factory = Factory(**factory_data)
    session.add(factory)
    session.commit()
    session.refresh(factory)
    return factory

@router.get("/{factory_id}")
def get_factory(factory_id: int, session: Session = Depends(get_session)):
    """Get a specific factory"""
    factory = session.get(Factory, factory_id)
    if not factory:
        raise HTTPException(404, "Factory not found")
    return factory

@router.put("/{factory_id}")
def update_factory(factory_id: int, updated_factory: Factory, session: Session = Depends(get_session)):
    """Update a factory"""
    factory = session.get(Factory, factory_id)
    if not factory:
        raise HTTPException(404, "Factory not found")
    
    factory.name = updated_factory.name
    factory.rate_per_kg = updated_factory.rate_per_kg
    factory.transport_deduction = updated_factory.transport_deduction
    factory.location = updated_factory.location
    factory.contact = updated_factory.contact
    factory.active = updated_factory.active
    
    session.add(factory)
    session.commit()
    session.refresh(factory)
    return factory

@router.delete("/{factory_id}")
def delete_factory(factory_id: int, session: Session = Depends(get_session)):
    """Delete a factory"""
    factory = session.get(Factory, factory_id)
    if not factory:
        raise HTTPException(404, "Factory not found")
    
    session.delete(factory)
    session.commit()
    return {"ok": True}

@router.post("/initialize-default")
def initialize_default_factories(session: Session = Depends(get_session)):
    """Initialize the system with default factories"""
    
    # Check if factories already exist
    existing = session.exec(select(Factory)).first()
    if existing:
        raise HTTPException(400, "Factories already initialized")
    
    default_factories = [
        Factory(name="Kaisugu Factory", rate_per_kg=22, location="Kaisugu", transport_deduction=3.0),
        Factory(name="Finlays Factory", rate_per_kg=27, location="Finlays", transport_deduction=3.0),
        Factory(name="Kuresoi Factory", rate_per_kg=23, location="Kuresoi", transport_deduction=3.0),
        Factory(name="Mbogo Valley Factory", rate_per_kg=23, location="Mbogo Valley", transport_deduction=3.0),
        Factory(name="Unilever Factory", rate_per_kg=28, location="Unilever", transport_deduction=3.0),
        Factory(name="KTDA", rate_per_kg=26, location="KTDA", transport_deduction=3.0),
    ]
    
    for factory in default_factories:
        session.add(factory)
    
    session.commit()
    
    return {"ok": True, "message": "Initialized 6 default factories", "count": len(default_factories)}
