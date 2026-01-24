from database import Base
from sqlalchemy import Column, Integer, ForeignKey, String, text,  Date
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    published_journal = Column(String, nullable=True)
    published_date = Column(Date, server_default=text('CURRENT_DATE'))
    author_names = Column(String, nullable=False)
    corresponding_author_id = Column(Integer, ForeignKey("authors.id"), nullable=False)

    ####### relationships 
    # relationship to corresponding author 
    corresponding_author = relationship("Author", foreign_keys=[corresponding_author_id])

    # Many-to-many authors with order
    author_links = relationship(
        "AuthorArticle",
        back_populates="article",
        order_by="AuthorArticle.author_order"
    )

    # References this article makes
    outgoing_references = relationship(
        "Reference",
        foreign_keys="Reference.cited_from_id",
        back_populates="cited_from",
        cascade="all, delete-orphan"
    )

    # References pointing to this article
    incoming_references = relationship(
        "Reference",
        foreign_keys="Reference.cited_to_id",
        back_populates="cited_to",
        cascade="all, delete-orphan"
    )

    ##### Optional: convenience property to get Author objects directly to skip middle table 
    authors = association_proxy("author_links", "author")