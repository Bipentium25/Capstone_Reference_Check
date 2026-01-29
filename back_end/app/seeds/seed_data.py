# app/seeds/seed_data.py
from datetime import date
from app.database import SessionLocal
from app.models import Author, Article, AuthorArticle, Reference
from app.security import hash_password

def seed():
    db = SessionLocal()
    print("🔹 Seeding database...")

    # --- Authors ---
    authors_data = [
        {
            "name": "Alice Zhang",
            "email": "alice.zhang@example.com",
            "institute": "MIT",
            "job": "Research Scientist",
            "password": hash_password("password123"),
        },
        {
            "name": "Bob Smith",
            "email": "bob.smith@example.com",
            "institute": "Stanford",
            "job": "Professor",
            "password": hash_password("password123"),
        },
        {
            "name": "Carol Lee",
            "email": "carol.lee@example.com",
            "institute": "Harvard",
            "job": "Postdoc",
            "password": hash_password("password123"),
        },
        {
            "name": "David Wong",
            "email": "david.wong@example.com",
            "institute": "EDAM",
            "job": "Engineer",
            "password": hash_password("password123"),
        },
        {
            "name": "Eve Chen",
            "email": "eve.chen@example.com",
            "institute": "MIT",
            "job": "Data Scientist",
            "password": hash_password("password123"),
        },
    ]
    authors = [Author(**data) for data in authors_data]
    db.add_all(authors)
    db.commit()
    for author in authors:
        db.refresh(author)

    # --- Articles ---
    articles_data = [
        {
            "title": "Quantum Computing Advances",
            "content": "Exploring new qubit architectures and error correction techniques.",
            "published_journal": "Journal of Quantum Tech",
            "published_date": date(2024, 5, 20),
            "corresponding_author": authors[0],
            "author_names": "Alice Zhang, Bob Smith"
        },
        {
            "title": "Machine Learning in Energy Systems",
            "content": "Applying ML to predict energy consumption patterns.",
            "published_journal": "Energy Journal",
            "published_date": date(2023, 11, 10),
            "corresponding_author": authors[1],
            "author_names": "Bob Smith, Carol Lee"
        },
        {
            "title": "Data-Driven Optimization",
            "content": "Optimization ideas inspired by AI and quantum computing.",
            "published_journal": "Optimization Letters",
            "published_date": date(2024, 1, 15),
            "corresponding_author": authors[2],
            "author_names": "Carol Lee, David Wong, Eve Chen"
        }
    ]
    articles = [Article(**data) for data in articles_data]
    db.add_all(articles)
    db.commit()
    for article in articles:
        db.refresh(article)

    # --- AuthorArticle links ---
    links_data = [
        (articles[0], [authors[0], authors[1]]),
        (articles[1], [authors[1], authors[2]]),
        (articles[2], [authors[2], authors[3], authors[4]]),
    ]
    links = [
        AuthorArticle(article_id=article.id, author_id=author.id)
        for article, author_list in links_data
        for author in author_list
    ]
    db.add_all(links)
    db.commit()

    # --- References ---
    references_data = [
        (articles[0].id, articles[1].id, True, False, "Inspired by energy system predictions.", "Reference: quantum computing principles applied to ML."),
        (articles[1].id, articles[2].id, False, True, "Optimization techniques inspired by ML.", "Reference: data-driven optimization methodology."),
        (articles[2].id, articles[0].id, True, True, "Applying quantum techniques.", "Reference: feedback loop from prior quantum research."),
    ]
    references = [
        Reference(
            cited_from_id=from_id,
            cited_to_id=to_id,
            if_key_reference=key,
            if_secondary_reference=secondary,
            citation_content=citation_content,
            content=content
        )
        for from_id, to_id, key, secondary, citation_content, content in references_data
    ]
    db.add_all(references)
    db.commit()

    print("✅ Database seeded successfully!")

if __name__ == "__main__":
    seed()