from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.reference import Reference
from app.database import get_db
from pydantic import BaseModel

router = APIRouter(
    prefix="/references",
    tags=["references"]
)

# -------------------- Pydantic models --------------------
class ReferenceIn(BaseModel):
    cited_to_id: int
    cited_from_id: int
    if_key_reference: bool
    if_secondary_reference: bool
    citation_content: Optional[str] = None
    ai_rated_score: Optional[int] = None
    feedback: Optional[str] = None
    author_comment: Optional[str] = None

class ReferenceOut(BaseModel):
    id: int
    cited_to_id: int
    cited_from_id: int
    if_key_reference: bool
    if_secondary_reference: bool
    citation_content: Optional[str] = None
    ai_rated_score: Optional[int] = None
    feedback: Optional[str] = None
    author_comment: Optional[str] = None

    class Config:
        orm_mode = True

class ReferencePatch(BaseModel):
    if_key_reference: Optional[bool] = None
    if_secondary_reference: Optional[bool] = None
    ai_rated_score: Optional[int] = None
    feedback: Optional[str] = None
    author_comment: Optional[str] = None

# -------------------- Routes --------------------
@router.post("/", response_model=ReferenceOut)
def create_reference(ref_in: ReferenceIn, db: Session = Depends(get_db)):
    reference = Reference(**ref_in.dict())
    db.add(reference)
    db.commit()
    db.refresh(reference)
    return reference

@router.get("/{id}", response_model=ReferenceOut)
def get_reference(id: int, db: Session = Depends(get_db)):
    reference = db.get(Reference, id)
    if not reference:
        raise HTTPException(status_code=404, detail="Reference not found")
    return reference

@router.get("/from/{article_id}", response_model=List[ReferenceOut])
def get_references_from_article(article_id: int, db: Session = Depends(get_db)):
    return db.query(Reference).filter(Reference.cited_from_id == article_id).all()

@router.get("/to/{article_id}", response_model=List[ReferenceOut])
def get_references_to_article(article_id: int, db: Session = Depends(get_db)):
    return db.query(Reference).filter(Reference.cited_to_id == article_id).all()

@router.patch("/{id}", response_model=ReferenceOut)
def patch_reference(id: int, ref_in: ReferencePatch, db: Session = Depends(get_db)):
    reference = db.get(Reference, id)
    if not reference:
        raise HTTPException(status_code=404, detail="Reference not found")
    
    update_data = ref_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(reference, key, value)
    
    db.commit()
    db.refresh(reference)
    return reference