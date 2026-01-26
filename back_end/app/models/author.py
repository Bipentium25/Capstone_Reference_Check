from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy
from app.database import Base

class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)  # unique for object linking
    institute = Column(String, nullable=True)
    job = Column(String, nullable=True)

    # link to AuthorArticle junction table
    article_links = relationship("AuthorArticle",back_populates="author",cascade="all, delete-orphan")

    # convenience: directly get Article objects
    articles = association_proxy("article_links", "article")