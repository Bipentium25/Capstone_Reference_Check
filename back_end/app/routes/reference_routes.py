from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.reference import Reference
from app.models.article import Article
from app.database import get_db
from app.schema import ReferenceIn, ReferenceOut, ReferencePatch
import resend
import os
from app.ai_score import get_ai_reference_score


resend.api_key = os.getenv("RESEND_API_KEY")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

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
import os

# At the top of your file with other imports
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

@router.post("/", response_model=ReferenceOut)
def create_reference(ref_in: ReferenceIn, db: Session = Depends(get_db)):
    """
    Create a new reference, get AI score, and send validation email.
    """
    # Fetch the articles to get their details
    citing_article = db.query(Article).filter(Article.id == ref_in.cited_from_id).first()
    referenced_article = db.query(Article).filter(Article.id == ref_in.cited_to_id).first()
    
    if not citing_article or not referenced_article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Create the reference
    reference = Reference(**ref_in.dict())
    db.add(reference)
    db.commit()
    db.refresh(reference)
    
    # Get AI score
    try:
        print("🤖 Getting AI score...")
        ai_score = get_ai_reference_score(citing_article, referenced_article, reference)
        if ai_score is not None:
            reference.ai_rated_score = ai_score
            db.commit()
            db.refresh(reference)
            print(f"✅ AI score saved: {ai_score}/10")
        else:
            print("⚠️ AI score returned None")
    except Exception as e:
        print(f"❌ Failed to get AI score: {e}")
        # Continue without score - don't fail the request
    
    # Send validation email to the referenced article's corresponding author
    try:
        validator_email = referenced_article.corresponding_author.email
        
        # Only send email if it's the admin email (testing mode)
        if validator_email != ADMIN_EMAIL:
            print(f"⚠️ Skipping email to {validator_email} (not admin email, testing mode)")
            return serialize_reference(reference)
        
        # Include AI score in email if available
        ai_score_html = f"""
            <p><strong>AI Quality Score:</strong> {reference.ai_rated_score}/10</p>
        """ if reference.ai_rated_score is not None else ""
        
        params: resend.Emails.SendParams = {
            "from": "onboarding@resend.dev",
            "to": [validator_email],
            "subject": f"Reference Validation Request - {citing_article.title}",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Reference Validation Request</h2>
                    
                    <p>Hello {referenced_article.corresponding_author.name},</p>
                    
                    <p>Your work has been cited and needs validation.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Citation Details:</h3>
                        
                        <p><strong>Citing Article:</strong><br/>
                        "{citing_article.title}"<br/>
                        <em>by {citing_article.author_names}</em></p>
                        
                        <p><strong>Your Work Being Cited:</strong><br/>
                        "{referenced_article.title}"<br/>
                        <em>by {referenced_article.author_names}</em></p>
                        
                        {f'<p><strong>Citation Context:</strong><br/>{ref_in.citation_content}</p>' if ref_in.citation_content else ''}
                        
                        <p><strong>Reference Content:</strong><br/>
                        {ref_in.content}</p>
                        
                        {ai_score_html}
                        
                        <p><strong>Key Reference:</strong> {'Yes' if ref_in.if_key_reference else 'No'}</p>
                        <p><strong>Secondary Reference:</strong> {'Yes' if ref_in.if_secondary_reference else 'No'}</p>
                    </div>
                    
                    <p>Please review whether this reference is:</p>
                    <ul>
                        <li>Relevant to the claim being made</li>
                        <li>Accurately represents your work</li>
                        <li>Properly contextualized</li>
                    </ul>
                    
                    <div style="margin: 30px 0;">
                        <a href="https://capstone-reference-check-67ra.vercel.app/articles/{citing_article.id}/reference/{reference.id}/feedback" 
                            style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                                text-decoration: none; border-radius: 5px; display: inline-block;">
                            Validate Reference
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message from the REFEX Reference Validation System.
                    </p>
                </div>
            """
        }
        
        resend.Emails.send(params)
        print(f"✅ Email sent to {validator_email}")
        
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
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