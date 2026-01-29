from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import date


# -------------------- article models --------------------
class ArticleIn(BaseModel):
    title: str
    content: str
    published_journal: str
    published_date: date
    subject: Optional[str] = None
    keywords: List[str] = []
    corresponding_author_email: str
    author_names: List[str]
    author_emails: List[Optional[str]]  # aligned list, None if unknown

class ArticleOut(BaseModel):
    id: int
    title: str
    content: str
    published_journal: str
    published_date: date
    subject: Optional[str] = None
    keywords: List[str] = []
    corresponding_author_id: Optional[int] = None
    author_names: List[str]
    author_ids: List[Optional[int]] = []  # aligned with names

    model_config = {
        "from_attributes": True
    }


# -------------------- author models --------------------
class AuthorEmailIn(BaseModel):
    email: EmailStr

class ArticleSummary(BaseModel):
    id: int
    title: str

class AuthorIn(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str  # <--- add this, required for creating author / login
    institute: Optional[str] = None
    job: Optional[str] = None

class AuthorOut(BaseModel):
    id: int
    name: str
    email: Optional[EmailStr]
    institute: Optional[str]
    job: Optional[str]
    articles: List[ArticleSummary] = []

    model_config = {
        "from_attributes": True
    }


# -------------------- reference models --------------------
class ReferenceIn(BaseModel):
    cited_to_id: int
    cited_from_id: int
    if_key_reference: bool
    if_secondary_reference: bool
    citation_content: Optional[str] = None
    ai_rated_score: Optional[int] = None
    feedback: Optional[str] = None
    author_comment: Optional[str] = None


class ReferenceOut(BaseModel):
    id: int
    cited_to_id: int
    cited_from_id: int
    if_key_reference: bool
    if_secondary_reference: bool
    citation_content: Optional[str] = None
    ai_rated_score: Optional[int] = None
    feedback: Optional[str] = None
    author_comment: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

# -------------------- login schema --------------------
class AuthorLogin(BaseModel):
    email: EmailStr
    password: str