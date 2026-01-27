from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.author import Author
from app.database import get_db
from app.schemas import AuthorLogin, AuthorOut
from app.security import verify_password  # from step 4

router = APIRouter(
    prefix="/client",
    tags=["client"]
)

@router.post("/login", response_model=AuthorOut)
def login_author(login_data: AuthorLogin, db: Session = Depends(get_db)):
    # 1️⃣ Find author by email
    author = db.query(Author).filter(Author.email == login_data.email).first()
    if not author:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # 2️⃣ Verify password
    if not verify_password(login_data.password, author.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # 3️⃣ Build article summaries
    articles = [{"id": a.id, "title": a.title} for a in author.articles]

    # 4️⃣ Return AuthorOut
    return AuthorOut(
        id=author.id,
        name=author.name,
        email=author.email,
        institute=author.institute,
        job=author.job,
        articles=articles
    )