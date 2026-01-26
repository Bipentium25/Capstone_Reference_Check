from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AuthorArticle(Base):
    __tablename__ = "author_article"

    id = Column(Integer, primary_key=True, autoincrement=True)  # <-- ADD THIS
    author_id = Column(Integer, ForeignKey("authors.id"), nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False)

    author = relationship("Author", back_populates="article_links")
    article = relationship("Article", back_populates="author_links")