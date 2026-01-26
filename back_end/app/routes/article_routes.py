from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.article import Article
from app.models.author import Author
from app.models.author_article import AuthorArticle
from app.database import get_db
from pydantic import BaseModel
from datetime import date

router = APIRouter(
    prefix="/articles",
    tags=["articles"]
)

# -------------------- Pydantic models --------------------
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
    corresponding_author_id: Optional[int] = None
    author_names: List[str]
    author_ids: List[int] = []

    class Config:
        orm_mode = True

# -------------------- Helper --------------------
def serialize_article(article: Article) -> ArticleOut:
    """Helper to convert Article + links to ArticleOut"""
    author_ids = [link.author_id for link in article.author_links]
    author_names = [link.author.name for link in article.author_links]
    return ArticleOut(
        id=article.id,
        title=article.title,
        content=article.content,
        published_journal=article.published_journal,
        published_date=article.published_date,
        corresponding_author_id=article.corresponding_author_id,
        author_ids=author_ids,
        author_names=author_names
    )

# -------------------- Routes --------------------
# Get all articles of an author
@router.get("/authors/{author_id}/articles", response_model=List[ArticleOut])
def get_articles_by_author(author_id: int, db: Session = Depends(get_db)):
    author = db.get(Author, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    articles = [serialize_article(article) for article in author.articles]
    return articles

# Get article by id
@router.get("/{id}", response_model=ArticleOut)
def get_article(id: int, db: Session = Depends(get_db)):
    article = db.get(Article, id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return serialize_article(article)

# Delete article by id
@router.delete("/{id}")
def delete_article_by_id(id: int, db: Session = Depends(get_db)):
    article = db.get(Article, id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    title = article.title
    db.delete(article)
    db.commit()
    return {"message": f"Article '{title}'-{id} deleted successfully"}

# Create a new article
@router.post("/", response_model=ArticleOut)
def create_article(article_in: ArticleIn, db: Session = Depends(get_db)):
    if len(article_in.author_names) != len(article_in.author_ids):
        raise HTTPException(status_code=400, detail="author_names and author_ids length mismatch")
    
    # Prepare article object
    article_data = article_in.dict(exclude={"author_ids"})
    article_data["author_names"] = ", ".join(article_in.author_names)
    article = Article(**article_data)
    db.add(article)
    db.commit()
    db.refresh(article)

    # Link internal authors with order
    for idx, aid in enumerate(article_in.author_ids):
        if aid:  # skip None or 0
            author = db.get(Author, aid)
            if author:
                link = AuthorArticle(article=article, author=author, author_order=idx + 1)
                article.author_links.append(link)
    
    db.commit()
    return serialize_article(article)