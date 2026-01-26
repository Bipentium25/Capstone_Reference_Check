# app/seeds/seed_data.py
from datetime import date
from app.database import SessionLocal
from app.models import Author, Article, AuthorArticle, Reference

def seed():
    db = SessionLocal()
    print("🔹 Seeding database...")

    # --- Authors ---
    alice = Author(name="Alice Zhang", email="alice.zhang@example.com", institute="MIT", job="Research Scientist")
    bob = Author(name="Bob Smith", email="bob.smith@example.com", institute="Stanford", job="Professor")
    carol = Author(name="Carol Lee", email="carol.lee@example.com", institute="Harvard", job="Postdoc")
    david = Author(name="David Wong", email="david.wong@example.com", institute="EDAM", job="Engineer")
    eve = Author(name="Eve Chen", email="eve.chen@example.com", institute="MIT", job="Data Scientist")

    authors = [alice, bob, carol, david, eve]
    db.add_all(authors)
    db.commit()
    for author in authors:
        db.refresh(author)

    # --- Articles ---
    article1 = Article(
        title="Quantum Computing Advances",
        content="Exploring new qubit architectures and error correction techniques.",
        published_journal="Journal of Quantum Tech",
        published_date=date(2024, 5, 20),
        corresponding_author=alice,
        author_names="Alice Zhang, Bob Smith"
    )

    article2 = Article(
        title="Machine Learning in Energy Systems",
        content="Applying ML to predict energy consumption patterns.",
        published_journal="Energy Journal",
        published_date=date(2023, 11, 10),
        corresponding_author=bob,
        author_names="Bob Smith, Carol Lee"
    )

    article3 = Article(
        title="Data-Driven Optimization",
        content="Optimization ideas inspired by AI and quantum computing.",
        published_journal="Optimization Letters",
        published_date=date(2024, 1, 15),
        corresponding_author=carol,
        author_names="Carol Lee, David Wong, Eve Chen"
    )

    articles = [article1, article2, article3]
    db.add_all(articles)
    db.commit()
    for article in articles:
        db.refresh(article)

    # --- AuthorArticle links ---
    links = [
        AuthorArticle(article_id=article1.id, author_id=alice.id),
        AuthorArticle(article_id=article1.id, author_id=bob.id),
        AuthorArticle(article_id=article2.id, author_id=bob.id),
        AuthorArticle(article_id=article2.id, author_id=carol.id),
        AuthorArticle(article_id=article3.id, author_id=carol.id),
        AuthorArticle(article_id=article3.id, author_id=david.id),
        AuthorArticle(article_id=article3.id, author_id=eve.id),
    ]

    db.add_all(links)
    db.commit()

    # --- References ---
    references = [
        Reference(
            cited_from_id=article1.id,
            cited_to_id=article2.id,
            if_key_reference=True,
            if_secondary_reference=False,
            citation_content="Inspired by energy system predictions.",
            content="Reference: quantum computing principles applied to ML.",
        ),
        Reference(
            cited_from_id=article2.id,
            cited_to_id=article3.id,
            if_key_reference=False,
            if_secondary_reference=True,
            citation_content="Optimization techniques inspired by ML.",
            content="Reference: data-driven optimization methodology.",
        ),
        Reference(
            cited_from_id=article3.id,
            cited_to_id=article1.id,
            if_key_reference=True,
            if_secondary_reference=True,
            citation_content="Applying quantum techniques.",
            content="Reference: feedback loop from prior quantum research.",
        )
    ]

    db.add_all(references)
    db.commit()

    print("✅ Database seeded successfully!")

# for direct execution
if __name__ == "__main__":
    seed()