from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from models.reference import Reference
from database import get_db
from pydantic import BaseModel
from models import Author
from datetime import date

## router that got imported into main.py
router = APIRouter(
    prefix="/references",
    tags=["references"]
)

# data in and out model for pydantic 
class ReferenceIn(BaseModel):
    cited_to_id: int
    cited_from_id: int
    if_key_reference: bool
    if_secondary_reference: bool
    citation_content: Optional[str] = None
    ai_rated_score : Optional[int] = None
    feedback: Optional[str] = None
    author_comment: Optional[str] = None


class ReferenceOut(BaseModel):
    id: int
    cited_to_id: int
    cited_from_id: int
    if_key_reference: bool
    if_secondary_reference: bool
    citation_content: Optional[str] = None
    ai_rated_score : Optional[int] = None
    feedback: Optional[str] = None
    author_comment: Optional[str] = None


    class Config:
        orm_mode = True

# special fields that allow patch 
class ReferencePatch(BaseModel):
    if_key_reference: Optional[bool] = None
    if_secondary_reference: Optional[bool] = None
    ai_rated_score: Optional[int] = None
    feedback: Optional[str] = None
    author_comment: Optional[str] = None

# post reference 
@router.post("/", response_model=ReferenceOut)
def create_reference(ref_in: ReferenceIn, db: Session = Depends(get_db)):
    reference = Reference(**ref_in.dict())
    db.add(reference)
    db.commit()
    db.refresh(reference)
    return reference


# Articles this one cites
@router.get("/from/{article_id}", response_model=List[ReferenceOut])
def get_references_from_article(article_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Reference)
        .filter(Reference.cited_from_id == article_id)
        .all()
    )

# Articles citing this one
@router.get("/to/{article_id}", response_model=List[ReferenceOut])
def get_references_to_article(article_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Reference)
        .filter(Reference.cited_to_id == article_id)
        .all()
    )


# get reference by reference id
@router.get("/{id}", response_model=ReferenceOut)
def get_reference_by_id(id: int, db: Session = Depends(get_db)):
    reference = db.get(Reference, id)
    if not reference:
        raise HTTPException(status_code=404, detail="Reference not found")
    return reference


#patch a reference
@router.patch("/{id}", response_model=ReferenceOut)
def update_reference(
    id: int,
    ref_in: ReferencePatch,
    db: Session = Depends(get_db)
):
    reference = db.get(Reference, id)
    if not reference:
        raise HTTPException(status_code=404, detail="Reference not found")

    for key, value in ref_in.dict(exclude_unset=True).items():
        setattr(reference, key, value)

    db.commit()
    db.refresh(reference)
    return reference