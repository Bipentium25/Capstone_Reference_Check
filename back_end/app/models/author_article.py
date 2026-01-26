from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AuthorArticle(Base):
    __tablename__ = "author_article"

    article_id = Column(ForeignKey("articles.id"), primary_key=True)
    author_id = Column(ForeignKey("authors.id"), primary_key=True)
    author_order = Column(Integer, nullable=False)

    article = relationship("Article", back_populates="author_links")
    author = relationship("Author", back_populates="article_links")