from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.article import Article
from app.models.author import Author
from app.models.author_article import AuthorArticle
from app.database import get_db
from datetime import date
from app.schema import ArticleIn, ArticleOut
from sqlalchemy import or_

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

# -------------------- Unified Search --------------------
@router.get("/search", response_model=List[ArticleOut])
def search_articles(
    title: Optional[str] = Query(None, description="Search in article title (partial, case-insensitive)"),
    subject: Optional[str] = Query(None, description="Search in article subject (partial, case-insensitive)"),
    keyword: Optional[str] = Query(None, description="Comma-separated keywords (partial, case-insensitive)"),
    db: Session = Depends(get_db)
):
    """
    Unified search for articles by title, subject, and/or keywords.
    Partial, case-insensitive match. Keywords can be comma-separated.
    """
    query = db.query(Article)

    # Title filter
    if title:
        query = query.filter(Article.title.ilike(f"%{title}%"))

    # Subject filter
    if subject:
        query = query.filter(Article.subject.ilike(f"%{subject}%"))

    # Keyword filter
    if keyword:
        keywords_list = [k.strip() for k in keyword.split(",") if k.strip()]
        conditions = [Article.keywords.ilike(f"%{k}%") for k in keywords_list]
        query = query.filter(or_(*conditions))

    articles = query.all()

    if not articles:
        raise HTTPException(status_code=404, detail="No articles found matching search criteria")

    return [serialize_article(a) for a in articles]

# -------------------- lucky --------------------
@router.get("/lucky")
def get_lucky_article(subject: Optional[str] = None, db: Session = Depends(get_db)):

    import random
    
    query = db.query(Article.id)
    
    if subject:
        query = query.filter(Article.subject.ilike(f"%{subject}%"))
    
    count = query.count()
    
    if count == 0:
        raise HTTPException(status_code=404, detail="No articles found for this subject")
    
    # Get random article ID
    random_offset = random.randint(0, count - 1)
    article_id = query.offset(random_offset).first()[0]
    
    return {"id": article_id}

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

