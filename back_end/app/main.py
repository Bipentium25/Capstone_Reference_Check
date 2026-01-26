from fastapi import FastAPI
from app.models.author import Author
from app.models.article import Article
from app.models.author_article import AuthorArticle
from app.models.reference import Reference

from app.routes.author_routes import router as authors_router
from app.routes.article_routes import router as articles_router
from app.routes.reference_routes import router as references_router

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Welcome to reference checking system."}

# 🔑 INCLUDE THE ROUTER
app.include_router(authors_router)
app.include_router(articles_router)
app.include_router(references_router)


@app.get("/debug", tags=["Debug"])
def debug():
    return {"debug": "visible"}