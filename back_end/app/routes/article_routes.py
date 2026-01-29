from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.article import Article
from app.models.author import Author
from app.models.author_article import AuthorArticle
from app.database import get_db
from datetime import date
from app.schema import ArticleIn, ArticleOut

router = APIRouter(
    prefix="/articles",
    tags=["articles"]
)

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
        subject=article.subject,
        keywords=article.keywords.split(", ") if article.keywords else [],
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
    if len(article_in.author_names) != len(article_in.author_emails):
        raise HTTPException(status_code=400, detail="author_names and author_emails length mismatch")

    corresponding_author = db.query(Author).filter(
        Author.email == article_in.corresponding_author_email
    ).first()
    if not corresponding_author:
        raise HTTPException(
            status_code=404,
            detail=f"Corresponding author '{article_in.corresponding_author_email}' not found"
        )

    # Map emails to DB author IDs (None if not found)
    author_ids = []
    for email in article_in.author_emails:
        if email:
            author = db.query(Author).filter(Author.email == email).first()
            author_ids.append(author.id if author else None)
        else:
            author_ids.append(None)

    # Create article
    article = Article(
        title=article_in.title,
        content=article_in.content,
        published_journal=article_in.published_journal,
        published_date=article_in.published_date,
        subject=article_in.subject,
        keywords=", ".join(article_in.keywords),
        corresponding_author_id=corresponding_author.id,
        author_names=", ".join(article_in.author_names)
    )

    db.add(article)
    db.flush()  # assigns article.id without committing yet

    # Link real authors only
    for author_id in author_ids:
        if author_id:
            db.add(AuthorArticle(article_id=article.id, author_id=author_id))

    db.commit()
    db.refresh(article)

    return ArticleOut(
        id=article.id,
        title=article.title,
        content=article.content,
        published_journal=article.published_journal,
        published_date=article.published_date,
        corresponding_author_id=article.corresponding_author_id,
        subject=article.subject,
        keywords=article.keywords.split(", ") if article.keywords else [],
        author_names=article_in.author_names,
        author_ids=author_ids
    )

# -------------------- Unified Search --------------------
@router.get("/search", response_model=List[ArticleOut])
def search_articles(
    subject: Optional[str] = Query(None, description="Search subject (partial, case-insensitive)"),
    keyword: Optional[str] = Query(None, description="Search keyword (partial, case-insensitive)"),
    db: Session = Depends(get_db)
):
    """
    Search articles by subject and/or keyword.
    Both filters are optional; partial, case-insensitive matching.
    """
    query = db.query(Article)

    if subject:
        query = query.filter(Article.subject.ilike(f"%{subject}%"))
    if keyword:
        query = query.filter(Article.keywords.ilike(f"%{keyword}%"))

    articles = query.all()

    if not articles:
        raise HTTPException(status_code=404, detail="No articles found matching the search criteria")

    return [serialize_article(article) for article in articles]