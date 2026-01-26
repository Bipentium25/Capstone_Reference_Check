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
    corresponding_author_email: str
    author_names: List[str]
    author_emails: List[Optional[str]]  # aligned list, None if unknown

class ArticleOut(BaseModel):
    id: int
    title: str
    content: str
    published_journal: str
    published_date: date
    corresponding_author_id: Optional[int] = None
    author_names: List[str]
    author_ids: List[Optional[int]] = []  # aligned with names

    model_config = {
        "from_attributes": True
    }

# -------------------- Helper --------------------
def serialize_article(article: Article, input_order_authors: Optional[List[Author]] = None) -> ArticleOut:
    """
    Convert Article + links to ArticleOut.
    If input_order_authors is provided, use it to preserve input order
    including None for authors not in system.
    """
    if input_order_authors:
        author_names = [a.name for a in input_order_authors]
        author_ids = [a.id if a.id else None for a in input_order_authors]
    else:
        # fallback: use existing links
        author_names = [link.author.name for link in article.author_links]
        author_ids = [link.author_id for link in article.author_links]

    return ArticleOut(
        id=article.id,
        title=article.title,
        content=article.content,
        published_journal=article.published_journal,
        published_date=article.published_date,
        corresponding_author_id=article.corresponding_author_id,
        author_names=author_names,
        author_ids=author_ids
    )

# -------------------- Routes --------------------
@router.get("/authors/{author_id}/articles", response_model=List[ArticleOut])
def get_articles_by_author(author_id: int, db: Session = Depends(get_db)):
    author = db.get(Author, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    return [serialize_article(article) for article in author.articles]

@router.get("/{id}", response_model=ArticleOut)
def get_article(id: int, db: Session = Depends(get_db)):
    article = db.get(Article, id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return serialize_article(article)

@router.delete("/{id}")
def delete_article_by_id(id: int, db: Session = Depends(get_db)):
    article = db.get(Article, id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    db.delete(article)
    db.commit()
    return {"message": f"Article '{article.title}'-{id} deleted successfully"}

# -------------------- Create Article --------------------
@router.post("/", response_model=ArticleOut)
def create_article(article_in: ArticleIn, db: Session = Depends(get_db)):
    # Validate input list lengths
    if len(article_in.author_names) != len(article_in.author_emails):
        raise HTTPException(status_code=400, detail="author_names and author_emails length mismatch")

    # Find corresponding author
    corresponding_author = db.query(Author).filter(Author.email == article_in.corresponding_author_email).first()
    if not corresponding_author:
        raise HTTPException(status_code=404, detail=f"Corresponding author '{article_in.corresponding_author_email}' not found")

    # Prepare authors list aligned with input order
    authors = []
    for name, email in zip(article_in.author_names, article_in.author_emails):
        if email:
            author = db.query(Author).filter(Author.email == email).first()
            if author:
                authors.append(author)
            else:
                authors.append(Author(name=name, email=None))  # placeholder, not in DB
        else:
            authors.append(Author(name=name, email=None))  # placeholder, not in DB

    # Create article
    article = Article(
        title=article_in.title,
        content=article_in.content,
        published_journal=article_in.published_journal,
        published_date=article_in.published_date,
        corresponding_author_id=corresponding_author.id,
        author_names=", ".join(article_in.author_names)
    )
    db.add(article)
    db.commit()
    db.refresh(article)

    # Link only authors that exist in DB (have id)
    for author in authors:
        if author.id:
            link = AuthorArticle(article=article, author=author)
            article.author_links.append(link)

    db.commit()
    return serialize_article(article, input_order_authors=authors)