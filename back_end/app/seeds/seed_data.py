# app/seeds/seed_data.py
from datetime import date
from app.database import SessionLocal
from app.models import Author, Article, AuthorArticle, Reference
from app.security import hash_password

def seed():
    db = SessionLocal()
    print("🔹 Seeding database...")

    # -------------------- Authors --------------------
    authors_data = [
        {"name": "Alice Zhang", "email": "alice.zhang@example.com", "institute": "MIT", "job": "Research Scientist"},
        {"name": "Bob Smith", "email": "bob.smith@example.com", "institute": "Stanford", "job": "Professor"},
        {"name": "Carol Lee", "email": "carol.lee@example.com", "institute": "Harvard", "job": "Postdoc"},
        {"name": "David Wong", "email": "david.wong@example.com", "institute": "EDAM", "job": "Engineer"},
        {"name": "Eve Chen", "email": "eve.chen@example.com", "institute": "MIT", "job": "Data Scientist"},
    ]

    authors = [
        Author(**data, password=hash_password("password123"))
        for data in authors_data
    ]
    db.add_all(authors)
    db.commit()
    for a in authors:
        db.refresh(a)

    # -------------------- Articles (10) --------------------
    articles_data = [
        {
            "title": "Quantum Computing Advances",
            "content": (
    "Recent progress in quantum computing has focused on scalable qubit architectures, "
    "robust error correction mechanisms, and noise mitigation strategies. Researchers "
    "investigate hybrid quantum-classical algorithms to improve performance in cryptography, "
    "optimization, and physical simulations, aiming to bridge theoretical models with "
    "practical, fault-tolerant quantum systems."
    ),
            "published_journal": "Journal of Quantum Tech",
            "published_date": date(2024, 5, 20),
            "corresponding_author_id": authors[0].id,
            "author_names": "Alice Zhang, Bob Smith",
            "subject": "Quantum Computing",
            "keywords": "Quantum, Qubit, Error Correction",
        },
        {
            "title": "Machine Learning in Energy Systems",
            "content": (
    "Machine learning methods are increasingly applied to modern energy systems to enhance "
    "demand forecasting, fault detection, and grid stability. By leveraging historical and "
    "real-time data, predictive models improve resource allocation, support renewable energy "
    "integration, and enable adaptive control strategies for intelligent power networks."
),
            "published_journal": "Energy Journal",
            "published_date": date(2023, 11, 10),
            "corresponding_author_id": authors[1].id,
            "author_names": "Bob Smith, Carol Lee",
            "subject": "Energy Systems",
            "keywords": "Machine Learning, Energy, Forecasting",
        },
        {
            "title": "Data-Driven Optimization",
            "content": (
    "Data-driven optimization combines statistical analysis with artificial intelligence to "
    "improve decision-making in complex systems. By integrating predictive models, simulation, "
    "and reinforcement learning, these methods reduce computational costs while achieving "
    "near-optimal solutions across logistics, manufacturing, and large-scale engineering problems."
),
            "published_journal": "Optimization Letters",
            "published_date": date(2024, 1, 15),
            "corresponding_author_id": authors[2].id,
            "author_names": "Carol Lee, David Wong, Eve Chen",
            "subject": "Optimization",
            "keywords": "Optimization, AI, Data Analytics",
        },
        {
            "title": "Reinforcement Learning for Control",
            "content": (
    "Reinforcement learning provides a flexible framework for controlling dynamic systems under "
    "uncertainty. Agents learn optimal policies through interaction with environments, enabling "
    "adaptive control in robotics, autonomous vehicles, and industrial processes where traditional "
    "model-based control approaches struggle to generalize effectively."
),
            "published_journal": "AI Control Review",
            "published_date": date(2024, 2, 2),
            "corresponding_author_id": authors[4].id,
            "author_names": "Eve Chen, Alice Zhang",
            "subject": "Reinforcement Learning",
            "keywords": "RL, Control, AI",
        },
        {
            "title": "Scalable Neural Architectures",
            "content": (
    "Scalable neural architectures address the growing computational demands of deep learning "
    "models. Research focuses on efficient parameterization, parallel training strategies, and "
    "hardware-aware design. These approaches enable large models to maintain performance while "
    "reducing memory usage, energy consumption, and training time in practical deployments."
),
            "published_journal": "Neural Computing",
            "published_date": date(2023, 8, 12),
            "corresponding_author_id": authors[1].id,
            "author_names": "Bob Smith",
            "subject": "Deep Learning",
            "keywords": "Neural Networks, Scaling",
        },
        {
            "title": "Hybrid Quantum-Classical Models",
            "content": (
    "Hybrid quantum-classical models combine classical machine learning pipelines with quantum "
    "circuits to exploit advantages of both paradigms. Classical components handle data preprocessing "
    "and optimization, while quantum layers perform specialized transformations, offering potential "
    "improvements in expressiveness for complex learning tasks."
),
            "published_journal": "Quantum AI",
            "published_date": date(2024, 6, 1),
            "corresponding_author_id": authors[0].id,
            "author_names": "Alice Zhang, Eve Chen",
            "subject": "Quantum AI",
            "keywords": "Quantum, Hybrid Models",
        },
        {
            "title": "Energy Forecasting with Transformers",
            "content": (
    "Transformer-based architectures have demonstrated strong performance in energy forecasting "
    "tasks by capturing long-range temporal dependencies. Attention mechanisms allow models to "
    "identify critical patterns in consumption data, leading to more accurate predictions and "
    "supporting improved planning and reliability in smart energy infrastructures."
),
            "published_journal": "Energy AI",
            "published_date": date(2024, 3, 18),
            "corresponding_author_id": authors[2].id,
            "author_names": "Carol Lee, Bob Smith",
            "subject": "Energy Forecasting",
            "keywords": "Transformers, Energy",
        },
        {
            "title": "Simulation-Based Optimization",
            "content": (
    "Simulation-based optimization leverages computational models to evaluate decision strategies "
    "before real-world deployment. By iteratively simulating scenarios and refining parameters, "
    "this approach enables robust optimization under uncertainty, particularly in engineering, "
    "transportation, and resource management applications."
),
            "published_journal": "Simulation Journal",
            "published_date": date(2023, 12, 5),
            "corresponding_author_id": authors[3].id,
            "author_names": "David Wong",
            "subject": "Simulation",
            "keywords": "Simulation, Optimization",
        },
        {
            "title": "Multi-Agent Systems in Smart Grids",
            "content": (
    "Multi-agent systems enable decentralized coordination in smart grids by modeling generators, "
    "consumers, and storage units as autonomous agents. Through communication and negotiation, "
    "agents collectively optimize energy distribution, enhance resilience, and respond efficiently "
    "to dynamic changes in supply and demand."
),
            "published_journal": "Smart Grid Review",
            "published_date": date(2024, 4, 9),
            "corresponding_author_id": authors[4].id,
            "author_names": "Eve Chen, Carol Lee",
            "subject": "Multi-Agent Systems",
            "keywords": "Agents, Smart Grid",
        },
        {
            "title": "Explainable AI for Scientific Models",
            "content": (
    "Explainable artificial intelligence aims to improve transparency and trust in complex models "
    "used for scientific discovery. By providing interpretable insights into model behavior, XAI "
    "techniques support validation, error analysis, and informed decision-making in high-stakes "
    "scientific and engineering applications."
),
            "published_journal": "XAI Journal",
            "published_date": date(2023, 10, 30),
            "corresponding_author_id": authors[0].id,
            "author_names": "Alice Zhang, David Wong",
            "subject": "Explainable AI",
            "keywords": "XAI, Interpretability",
        },
    ]

    articles = [Article(**data) for data in articles_data]
    db.add_all(articles)
    db.commit()
    for art in articles:
        db.refresh(art)

    # -------------------- AuthorArticle links --------------------
    author_map = {
        0: [0, 1],
        1: [1, 2],
        2: [2, 3, 4],
        3: [4, 0],
        4: [1],
        5: [0, 4],
        6: [2, 1],
        7: [3],
        8: [4, 2],
        9: [0, 3],
    }

    links = [
        AuthorArticle(article_id=articles[a].id, author_id=authors[u].id)
        for a, users in author_map.items()
        for u in users
    ]
    db.add_all(links)
    db.commit()

    # -------------------- References (12+) --------------------
    references_data = [
        (0, 1, True, False),
        (1, 2, False, True),
        (2, 3, True, True),
        (3, 4, False, False),
        (4, 5, True, False),
        (5, 0, False, True),
        (6, 1, True, False),
        (6, 2, False, True),
        (7, 2, True, False),
        (8, 6, False, False),
        (9, 0, True, True),
        (9, 3, False, True),
    ]

    references = [
        Reference(
            cited_from_id=articles[f].id,
            cited_to_id=articles[t].id,
            if_key_reference=key,
            if_secondary_reference=secondary,
            citation_content=f"Cites methods or data from {articles[t].title}",
            content=f"Reference discussing relationship between {articles[f].title} and {articles[t].title}",
        )
        for f, t, key, secondary in references_data
    ]

    db.add_all(references)
    db.commit()

    print("✅ Database seeded successfully with complex relationships!")

if __name__ == "__main__":
    seed()