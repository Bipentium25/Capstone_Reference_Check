from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from models.article import Article
from database import get_db
from pydantic import BaseModel
from models import Author
from datetime import date

## router that got imported into main.py
router = APIRouter(
    prefix="/articles",
    tags=["articles"]
)

# data in and out model for pydantic 
class ArticleIn(BaseModel):
    title: str
    content: str
    published_journal: str
    published_date: date
    corresponding_author_id: Optional[int] = None
    author_names: List[str]        # all names
    author_ids: List[Optional[int]] # 0 or None for non-existing authors


class ArticleOut(BaseModel):
    id: int
    title: str
    content: str
    published_journal: str
    published_date: date
    corresponding_author_id: int | None
    author_names: List[str]
    author_ids: Optional[List[int]] = []        # only internal authors

    class Config:
        orm_mode = True

# this end point returns all articles of an author by id
@router.get("/authors/{author_id}/articles", response_model=list[ArticleOut])
def get_articles_by_author(author_id: int, db: Session = Depends(get_db)):
    author = db.query(Author).get(author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    return author.articles

#article direct routes 
# get by id
@router.get("/{id}", response_model=ArticleOut)
def get_article(id: int, db: Session = Depends(get_db)):
    article = db.get(Article, id)
    if not article:
        raise HTTPException(status_code=404, detail="article not found")
    return article

# delete by id 
@router.delete("/{id}")
def delete_article_by_id(id: int, db: Session = Depends(get_db)):
    article = db.get(Article, id)
    if not article:
        raise HTTPException(status_code=404, detail="article not found")
    
    article_title = article.title
    db.delete(article)
    db.commit()
    
    return {"message": f"article '{article_title}'-{id} profile deleted"}

#post new article
@router.post("/", response_model=ArticleOut)
def create_article(article_in: ArticleIn, db: Session = Depends(get_db)):
    if len(article_in.author_names) != len(article_in.author_ids):
        raise HTTPException(status_code=400, detail="author_names and author_ids length mismatch")
    
    # store as comma-separated string for display
    article_data = article_in.dict()
    article_data["author_names"] = ", ".join(article_in.author_names)
    
    article = Article(**article_data)
    db.add(article)
    db.commit()
    db.refresh(article)

    # link internal authors
    for aid in article_in.author_ids:
        if aid:  # skip 0 or None
            author = db.get(Author, aid)
            if author:
                article.authors.append(author)
    db.commit()
    
    return article