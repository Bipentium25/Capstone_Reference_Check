from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.author import Author
from app.database import get_db
from pydantic import BaseModel, EmailStr

router = APIRouter(
    prefix="/authors",
    tags=["authors"]
)

# -------------------- Pydantic models --------------------
class AuthorIn(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    institute: Optional[str] = None
    job: Optional[str] = None

class AuthorOut(BaseModel):
    id: int
    name: str
    email: Optional[EmailStr]
    institute: Optional[str]
    job: Optional[str]

    class Config:
        orm_mode = True

# -------------------- Routes --------------------
@router.post("/", response_model=AuthorOut)
def create_author(author_in: AuthorIn, db: Session = Depends(get_db)):
    author = Author(**author_in.dict())
    db.add(author)
    db.commit()
    db.refresh(author)
    return author

@router.get("/", response_model=List[AuthorOut])
def get_authors(db: Session = Depends(get_db)):
    return db.query(Author).all()

@router.get("/{id}", response_model=AuthorOut)
def get_author(id: int, db: Session = Depends(get_db)):
    author = db.get(Author, id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return author

@router.delete("/{id}")
def delete_author_by_id(id: int, db: Session = Depends(get_db)):
    author = db.get(Author, id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    name = author.name
    db.delete(author)
    db.commit()
    return {"message": f"Author '{name}'-{id} deleted successfully"}

@router.patch("/{id}", response_model=AuthorOut)
def patch_author_by_id(id: int, author_in: AuthorIn, db: Session = Depends(get_db)):
    author = db.get(Author, id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    update_data = author_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(author, key, value)
    
    db.commit()
    db.refresh(author)
    return author