from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.author import Author
from app.database import get_db
from app.security import hash_password

from app.schema import AuthorIn, AuthorOut, AuthorEmailIn

router = APIRouter(
    prefix="/authors",
    tags=["authors"]
)

# -------------------- Routes --------------------

@router.post("/", response_model=AuthorOut)
def create_author(author_in: AuthorIn, db: Session = Depends(get_db)):
    # Hash the password before storing
    if not author_in.password:
        raise HTTPException(status_code=400, detail="Password is required")

    hashed_password = hash_password(author_in.password)

    author_data = author_in.dict(exclude={"password"})  # remove plain password
    author = Author(**author_data, password=hashed_password)

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

@router.post("/by-email", response_model=AuthorOut)
def get_author_by_email(author_email: AuthorEmailIn, db: Session = Depends(get_db)):
    author = db.query(Author).filter(Author.email == author_email.email).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    # build articles summary
    articles = [{"id": a.id, "title": a.title} for a in author.articles]

    return AuthorOut(
        id=author.id,
        name=author.name,
        email=author.email,
        institute=author.institute,
        job=author.job,
        articles=articles
    )

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