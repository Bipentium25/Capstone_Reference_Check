from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AuthorArticle(Base):
    __tablename__ = "author_article"

    # remove id
    author_id = Column(Integer, ForeignKey("authors.id"), primary_key=True)
    article_id = Column(Integer, ForeignKey("articles.id"), primary_key=True)

    author = relationship("Author", back_populates="article_links")
    article = relationship("Article", back_populates="author_links")