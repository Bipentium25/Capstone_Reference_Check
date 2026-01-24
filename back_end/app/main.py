from fastapi import FastAPI
from models import *
from routes.author_routes import router as authors_router
from routes.article_routes import router as articles_router
from routes.reference_routes import router as references_router

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