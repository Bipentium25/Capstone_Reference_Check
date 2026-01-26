from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AuthorArticle(Base):
    __tablename__ = "author_article"

    author_id = Column(Integer, ForeignKey("authors.id", ondelete="CASCADE"), primary_key=True)
    article_id = Column(Integer, ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True)

    article = relationship("Article", back_populates="author_links")
    author = relationship("Author", back_populates="article_links")