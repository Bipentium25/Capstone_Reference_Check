from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.reference import Reference
from app.models.article import Article
from app.database import get_db
from app.schema import ReferenceIn, ReferenceOut, ReferencePatch
import resend
import os

resend.api_key = os.getenv("RESEND_API_KEY")

router = APIRouter(
    prefix="/references",
    tags=["references"]
)

# -------------------- Helper --------------------
def serialize_reference(ref: Reference) -> ReferenceOut:
    """
    Serialize a Reference object to ReferenceOut, including
    cited article titles for frontend display.
    """
    return ReferenceOut(
        id=ref.id,
        cited_to_id=ref.cited_to_id,
        cited_from_id=ref.cited_from_id,
        cited_to_title=ref.cited_to.title if ref.cited_to else None,
        cited_from_title=ref.cited_from.title if ref.cited_from else None,
        if_key_reference=ref.if_key_reference,
        if_secondary_reference=ref.if_secondary_reference,
        citation_content=ref.citation_content,
        ai_rated_score=ref.ai_rated_score,
        feedback=ref.feedback,
        author_comment=ref.author_comment
    )

# -------------------- Routes --------------------
import resend
import os

resend.api_key = os.getenv("RESEND_API_KEY")

import os
import traceback

resend.api_key = os.getenv("RESEND_API_KEY")

@router.post("/", response_model=ReferenceOut)
def create_reference(ref_in: ReferenceIn, db: Session = Depends(get_db)):
    print("=" * 50)
    print("📧 REFERENCE CREATION STARTED")
    print("=" * 50)
    
    # Fetch the articles
    citing_article = db.query(Article).filter(Article.id == ref_in.cited_from_id).first()
    referenced_article = db.query(Article).filter(Article.id == ref_in.cited_to_id).first()
    
    print(f"Citing article ID: {ref_in.cited_from_id}")
    print(f"Referenced article ID: {ref_in.cited_to_id}")
    
    if not citing_article or not referenced_article:
        print("❌ ERROR: Article not found!")
        raise HTTPException(status_code=404, detail="Article not found")
    
    print(f"✅ Citing article found: {citing_article.title}")
    print(f"✅ Referenced article found: {referenced_article.title}")
    
    # Create the reference
    reference = Reference(**ref_in.dict())
    db.add(reference)
    db.commit()
    db.refresh(reference)
    
    print(f"✅ Reference created with ID: {reference.id}")
    
    # Send validation email
    print("=" * 50)
    print("📧 ATTEMPTING TO SEND EMAIL")
    print("=" * 50)
    
    try:
        # Get email from the referenced article's corresponding author
        validator_email = referenced_article.corresponding_author.email
        print(f"📧 Attempting to send email to: {validator_email}")
        
        params: resend.Emails.SendParams = {
            "from": "onboarding@resend.dev",
            "to": [validator_email],
            "subject": f"Reference Validation Request - {citing_article.title}",
            "html": f"""
                <h1>Test Email</h1>
                <p>Your work was cited!</p>
            """
        }
        
        email_response = resend.Emails.send(params)
        print("✅ Email sent successfully:", email_response)
        
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        traceback.print_exc()
    
    # These lines should be OUTSIDE the try/except block
    print("=" * 50)
    print("✅ REFERENCE CREATION COMPLETED")
    print("=" * 50)
    
    return serialize_reference(reference)

@router.get("/{id}", response_model=ReferenceOut)
def get_reference(id: int, db: Session = Depends(get_db)):
    """
    Get a single reference by ID.
    """
    reference = db.get(Reference, id)
    if not reference:
        raise HTTPException(status_code=404, detail="Reference not found")
    return serialize_reference(reference)

@router.get("/from/{article_id}", response_model=List[ReferenceOut])
def get_references_from_article(article_id: int, db: Session = Depends(get_db)):
    """
    Get all references **from** a given article.
    """
    refs = db.query(Reference).filter(Reference.cited_from_id == article_id).all()
    return [serialize_reference(r) for r in refs]

@router.get("/to/{article_id}", response_model=List[ReferenceOut])
def get_references_to_article(article_id: int, db: Session = Depends(get_db)):
    """
    Get all references **to** a given article.
    """
    refs = db.query(Reference).filter(Reference.cited_to_id == article_id).all()
    return [serialize_reference(r) for r in refs]

@router.patch("/{id}", response_model=ReferenceOut)
def patch_reference(id: int, ref_in: ReferencePatch, db: Session = Depends(get_db)):
    """
    Partially update a reference by ID.
    """
    reference = db.get(Reference, id)
    if not reference:
        raise HTTPException(status_code=404, detail="Reference not found")
    
    update_data = ref_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(reference, key, value)
    
    db.commit()
    db.refresh(reference)
    return serialize_reference(reference)