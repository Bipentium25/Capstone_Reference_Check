from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.reference import Reference
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
@router.post("/", response_model=ReferenceOut)
def create_reference(ref_in: ReferenceIn, db: Session = Depends(get_db)):
    """
    Create a new reference and send validation email.
    """
    # Create the reference
    reference = Reference(**ref_in.dict())
    db.add(reference)
    db.commit()
    db.refresh(reference)
    
    # Send validation email
    try:
        params: resend.Emails.SendParams = {
            "from": "onboarding@resend.dev",
            "to": [ref_in.validator_email],  # Assuming you have this field
            "subject": "Reference Validation Request",
            "html": f"""
                <h2>Reference Validation Request</h2>
                <p>You have been invited to validate a reference.</p>
                <p><strong>Article:</strong> {ref_in.article_title}</p>
                <p><strong>Reference:</strong> {ref_in.reference_title}</p>
                <p>Click here to validate: <a href="https://yourapp.com/validate/{reference.id}">Validate Reference</a></p>
            """
        }
        resend.Emails.send(params)
    except Exception as e:
        print(f"Failed to send email: {e}")
    
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