from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Dog, Litter

router = APIRouter()

# --- Dogs ---
@router.get("/dogs")
def list_dogs(session: Session = Depends(get_session)):
    return session.exec(select(Dog)).all()

@router.post("/dogs")
def add_dog(dog: Dog, session: Session = Depends(get_session)):
    session.add(dog)
    session.commit()
    session.refresh(dog)
    return dog

@router.get("/dogs/{dog_id}")
def get_dog(dog_id: int, session: Session = Depends(get_session)):
    dog = session.get(Dog, dog_id)
    if not dog:
        raise HTTPException(404, "Dog not found")
    return dog

@router.put("/dogs/{dog_id}")
def update_dog(dog_id: int, updated_dog: Dog, session: Session = Depends(get_session)):
    """Update a dog"""
    dog = session.get(Dog, dog_id)
    if not dog:
        raise HTTPException(404, "Dog not found")
    
    dog.name = updated_dog.name
    dog.breed = updated_dog.breed
    dog.gender = updated_dog.gender
    dog.dob = updated_dog.dob
    dog.status = updated_dog.status
    
    session.add(dog)
    session.commit()
    session.refresh(dog)
    return dog

@router.delete("/dogs/{dog_id}")
def delete_dog(dog_id: int, session: Session = Depends(get_session)):
    dog = session.get(Dog, dog_id)
    if not dog:
        raise HTTPException(404, "Dog not found")
    session.delete(dog)
    session.commit()
    return {"ok": True}

# --- Litters ---
@router.get("/litters")
def list_litters(session: Session = Depends(get_session)):
    return session.exec(select(Litter)).all()

@router.post("/litters")
def add_litter(litter: Litter, session: Session = Depends(get_session)):
    session.add(litter)
    session.commit()
    session.refresh(litter)
    return litter

@router.get("/litters/{litter_id}")
def get_litter(litter_id: int, session: Session = Depends(get_session)):
    """Get a specific litter"""
    litter = session.get(Litter, litter_id)
    if not litter:
        raise HTTPException(404, "Litter not found")
    return litter

@router.put("/litters/{litter_id}")
def update_litter(litter_id: int, updated_litter: Litter, session: Session = Depends(get_session)):
    """Update a litter"""
    litter = session.get(Litter, litter_id)
    if not litter:
        raise HTTPException(404, "Litter not found")
    
    litter.mother_id = updated_litter.mother_id
    litter.father_id = updated_litter.father_id
    litter.date_of_birth = updated_litter.date_of_birth
    litter.puppies_count = updated_litter.puppies_count
    
    session.add(litter)
    session.commit()
    session.refresh(litter)
    return litter

@router.delete("/litters/{litter_id}")
def delete_litter(litter_id: int, session: Session = Depends(get_session)):
    """Delete a litter"""
    litter = session.get(Litter, litter_id)
    if not litter:
        raise HTTPException(404, "Litter not found")
    
    session.delete(litter)
    session.commit()
    return {"ok": True}
