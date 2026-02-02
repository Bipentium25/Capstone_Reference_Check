from fastapi import FastAPI
from app.models.author import Author
from app.models.article import Article
from app.models.author_article import AuthorArticle
from app.models.reference import Reference

from app.routes.author_routes import router as authors_router
from app.routes.article_routes import router as articles_router
from app.routes.reference_routes import router as references_router
from app.routes.client_routes import router as client_router

from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://capstone-reference-check.onrender.com",
        "https://capstone-reference-check-z9yc-git-main-mengqiaos-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to reference checking system."}

# 🔑 INCLUDE THE ROUTER
app.include_router(authors_router)
app.include_router(articles_router)
app.include_router(references_router)
app.include_router(client_router)


@app.get("/debug", tags=["Debug"])
def debug():
    return {"debug": "visible"}