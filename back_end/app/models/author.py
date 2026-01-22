from database import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy

class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    institute = Column(String, nullable=True)
    job = Column(String, nullable=True)


    # Junction rows linking this author to articles
    article_links = relationship(
        "AuthorArticle",
        back_populates="author"
    )

    # Convenience property: list of Article objects
    articles = association_proxy("article_links", "article")