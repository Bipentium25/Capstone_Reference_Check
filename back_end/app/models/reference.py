from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Reference(Base):
    __tablename__ = "references"

    id = Column(Integer, primary_key=True)
    content = Column(String, nullable=False)

    cited_from_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    cited_to_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    
    if_key_reference = Column(Boolean, nullable=False)
    if_secondary_reference = Column(Boolean, nullable=False)
    citation_content = Column(String, nullable=True)
    ai_rated_score = Column(Integer, nullable=True)
    feedback = Column(String, nullable=True)
    author_comment = Column(String, nullable=True)

    cited_from = relationship("Article", foreign_keys=[cited_from_id], back_populates="outgoing_references")
    cited_to = relationship("Article", foreign_keys=[cited_to_id], back_populates="incoming_references")