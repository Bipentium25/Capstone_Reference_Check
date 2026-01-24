from datetime import date
from ..database import SessionLocal
from ..models import Author, Article, Reference

def seed():
    db = SessionLocal()

    try:
        # ---------- AUTHORS ----------
        alice = Author(
            name="Alice Zhang",
            email="alice.zhang@example.com",
            institute="MIT",
            job="Research Scientist"
        )

        bob = Author(
            name="Bob Smith",
            email="bob.smith@example.com",
            institute="Stanford",
            job="Professor"
        )

        db.add_all([alice, bob])
        db.commit()

        # refresh to get IDs
        db.refresh(alice)
        db.refresh(bob)

        # ---------- ARTICLES ----------
        article1 = Article(
            title="Deep Learning for Reference Checking",
            content="This paper explores automated reference validation.",
            published_journal="AI Research Journal",
            published_date=date(2024, 6, 1),
            corresponding_author_id=alice.id,
            author_names="Alice Zhang, Bob Smith"
        )

        article2 = Article(
            title="Citation Graph Analysis",
            content="Analyzing citation networks using graph theory.",
            published_journal="Data Science Review",
            published_date=date(2023, 11, 15),
            corresponding_author_id=bob.id,
            author_names="Bob Smith"
        )

        # link internal authors
        article1.authors.extend([alice, bob])
        article2.authors.append(bob)

        db.add_all([article1, article2])
        db.commit()

        db.refresh(article1)
        db.refresh(article2)

        # ---------- REFERENCES ----------
        ref1 = Reference(
            cited_from_id=article1.id,
            cited_to_id=article2.id,
            if_key_reference=True,
            if_secondary_reference=False,
            citation_content="Smith et al. (2023) introduced citation graphs.",
            ai_rated_score=85,
            feedback="Strong foundational reference",
            author_comment="Highly relevant background work"
        )

        db.add(ref1)
        db.commit()

        print("✅ Database seeded successfully")

    except Exception as e:
        db.rollback()
        print("❌ Seeding failed:", e)

    finally:
        db.close()


if __name__ == "__main__":
    seed()