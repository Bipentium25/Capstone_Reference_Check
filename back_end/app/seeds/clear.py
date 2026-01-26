from app.database import SessionLocal
from app.models import Author, Article, AuthorArticle, Reference

def clear_db():
    db = SessionLocal()
    try:
        print("🧹 Deleting all data...")

        # Delete in order to respect foreign keys
        db.query(Reference).delete()
        db.query(AuthorArticle).delete()
        db.query(Article).delete()
        db.query(Author).delete()

        db.commit()
        print("✅ All data deleted (tables remain intact)")
    finally:
        db.close()


if __name__ == "__main__":
    clear_db()