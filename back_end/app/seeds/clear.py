from app.database import SessionLocal
from app.models import Author, Article, AuthorArticle, Reference

def clear_db():
    db = SessionLocal()
    try:
        print("🧹 Deleting all data...")

        # Delete in order to respect foreign keys
        ref_count = db.query(Reference).count()
        aa_count = db.query(AuthorArticle).count()
        article_count = db.query(Article).count()
        author_count = db.query(Author).count()
        
        print(f"Before delete: {ref_count} refs, {aa_count} links, {article_count} articles, {author_count} authors")

        db.query(Reference).delete()
        db.query(AuthorArticle).delete()
        db.query(Article).delete()
        db.query(Author).delete()

        db.commit()
        
        # Verify deletion
        print(f"After delete: {db.query(Author).count()} authors remaining")
        print("✅ All data deleted (tables remain intact)")
    finally:
        db.close()


if __name__ == "__main__":
    clear_db()