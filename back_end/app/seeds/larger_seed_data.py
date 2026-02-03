from datetime import date
from itertools import cycle
from app.database import SessionLocal
from app.models import Author, Article, AuthorArticle, Reference
from app.security import hash_password


def seed():
    db = SessionLocal()
    print("🔹 Seeding database...")

    # ======================================================
    # Authors (10)
    # ======================================================
    authors_data = [
        {"name": "Alice Zhang", "email": "alice.zhang@example.com", "institute": "MIT", "job": "Research Scientist"},
        {"name": "Bob Smith", "email": "bob.smith@example.com", "institute": "Stanford", "job": "Professor"},
        {"name": "Carol Lee", "email": "carol.lee@example.com", "institute": "Harvard", "job": "Postdoc"},
        {"name": "David Wong", "email": "david.wong@example.com", "institute": "Berkeley", "job": "Engineer"},
        {"name": "Eve Chen", "email": "eve.chen@example.com", "institute": "MIT", "job": "Data Scientist"},
        {"name": "Frank Müller", "email": "frank.mueller@example.com", "institute": "ETH Zurich", "job": "Professor"},
        {"name": "Grace Kim", "email": "grace.kim@example.com", "institute": "Seoul National Univ.", "job": "Researcher"},
        {"name": "Hiro Tanaka", "email": "hiro.tanaka@example.com", "institute": "Tokyo Univ.", "job": "Associate Professor"},
        {"name": "Isabella Rossi", "email": "isabella.rossi@example.com", "institute": "EPFL", "job": "Postdoc"},
        {"name": "John Miller", "email": "john.miller@example.com", "institute": "Oxford", "job": "Lecturer"},
    ]

    authors = [
        Author(**data, password=hash_password("password123"))
        for data in authors_data
    ]
    db.add_all(authors)
    db.commit()
    for a in authors:
        db.refresh(a)

    # ======================================================
    # Articles (15) — Computer Science & Biology
    # ======================================================
    articles_data = [
        {
            "title": "Deep Learning for Protein Structure Prediction",
            "content": (
                "Deep learning techniques have significantly advanced protein structure prediction by "
                "learning complex spatial and biochemical constraints directly from amino acid sequences. "
                "Modern neural architectures integrate attention mechanisms and evolutionary information "
                "to infer folding patterns, enabling accurate structural predictions that support drug "
                "discovery, functional annotation, and large-scale biological analysis."
            ),
            "published_journal": "Computational Biology",
            "published_date": date(2024, 1, 12),
            "corresponding_author_id": authors[0].id,
            "author_names": "Alice Zhang, Eve Chen",
            "subject": "Computational Biology",
            "keywords": "Deep Learning, Protein Folding",
        },
        {
            "title": "Graph Neural Networks in Molecular Modeling",
            "content": (
                "Graph neural networks represent molecules as structured graphs where atoms and bonds "
                "encode chemical relationships. By propagating information across graph neighborhoods, "
                "these models capture molecular interactions, predict chemical properties, and support "
                "simulation tasks in drug design, toxicity screening, and materials science research."
            ),
            "published_journal": "Bioinformatics Review",
            "published_date": date(2024, 2, 5),
            "corresponding_author_id": authors[1].id,
            "author_names": "Bob Smith, Carol Lee",
            "subject": "Machine Learning",
            "keywords": "GNN, Molecules",
        },
        {
            "title": "Reinforcement Learning for Robotics Control",
            "content": (
                "Reinforcement learning enables robotic systems to learn control policies through interaction "
                "with dynamic environments. By optimizing long-term reward functions, agents adapt to "
                "uncertainty, sensor noise, and non-linear dynamics, supporting applications in manipulation, "
                "navigation, and autonomous decision-making across real-world robotic platforms."
            ),
            "published_journal": "Robotics and AI",
            "published_date": date(2023, 11, 20),
            "corresponding_author_id": authors[2].id,
            "author_names": "Carol Lee, David Wong",
            "subject": "Artificial Intelligence",
            "keywords": "RL, Robotics",
        },
        {
            "title": "Scalable Distributed Systems for Scientific Computing",
            "content": (
                "Scientific computing increasingly relies on distributed systems to process massive datasets "
                "and complex simulations. Scalable architectures coordinate computation across clusters, "
                "optimize communication overhead, and ensure fault tolerance, enabling efficient execution "
                "of physics, biology, and climate models at unprecedented scale."
            ),
            "published_journal": "Systems Journal",
            "published_date": date(2024, 3, 18),
            "corresponding_author_id": authors[3].id,
            "author_names": "David Wong, John Miller",
            "subject": "Computer Systems",
            "keywords": "Distributed Systems",
        },
        {
            "title": "Explainable AI in Medical Diagnostics",
            "content": (
                "Explainable artificial intelligence improves trust and transparency in medical diagnostic "
                "systems by revealing how models arrive at predictions. Interpretability techniques assist "
                "clinicians in validating results, identifying biases, and integrating AI-supported insights "
                "into high-stakes healthcare decision-making processes."
            ),
            "published_journal": "Medical AI",
            "published_date": date(2024, 4, 2),
            "corresponding_author_id": authors[4].id,
            "author_names": "Eve Chen, Grace Kim",
            "subject": "Explainable AI",
            "keywords": "XAI, Healthcare",
        },
        {
            "title": "Single-Cell RNA Sequencing Analysis Pipelines",
            "content": (
                "Single-cell RNA sequencing generates high-dimensional data describing gene expression at "
                "cellular resolution. Computational pipelines perform quality control, normalization, "
                "clustering, and annotation, enabling researchers to identify cell types, developmental "
                "trajectories, and disease-related transcriptional patterns."
            ),
            "published_journal": "Genomics Today",
            "published_date": date(2023, 9, 10),
            "corresponding_author_id": authors[5].id,
            "author_names": "Frank Müller, Isabella Rossi",
            "subject": "Genomics",
            "keywords": "scRNA-seq",
        },
        {
            "title": "Evolutionary Dynamics Modeled by Agent-Based Systems",
            "content": (
                "Agent-based models simulate populations of interacting individuals to study evolutionary "
                "dynamics over time. By encoding behavioral rules and environmental constraints, these "
                "simulations reveal emergent phenomena such as cooperation, adaptation, and population "
                "diversification in biological systems."
            ),
            "published_journal": "Theoretical Biology",
            "published_date": date(2024, 5, 6),
            "corresponding_author_id": authors[6].id,
            "author_names": "Grace Kim, Hiro Tanaka",
            "subject": "Computational Biology",
            "keywords": "Evolution, Simulation",
        },
        {
            "title": "Neural Coding and Information Theory",
            "content": (
                "Information theory provides a quantitative framework for understanding neural coding in "
                "biological systems. By measuring entropy, redundancy, and efficiency, researchers analyze "
                "how neurons encode sensory stimuli and transmit information under physical and metabolic "
                "constraints."
            ),
            "published_journal": "Neuroscience Reports",
            "published_date": date(2023, 12, 14),
            "corresponding_author_id": authors[7].id,
            "author_names": "Hiro Tanaka",
            "subject": "Neuroscience",
            "keywords": "Neural Coding",
        },
        {
            "title": "Bio-Inspired Optimization Algorithms",
            "content": (
                "Bio-inspired optimization algorithms draw inspiration from natural processes such as "
                "evolution, swarm behavior, and collective intelligence. These methods efficiently explore "
                "large search spaces, adapt to dynamic objectives, and solve complex optimization problems "
                "in engineering, logistics, and machine learning."
            ),
            "published_journal": "AI Optimization",
            "published_date": date(2024, 1, 30),
            "corresponding_author_id": authors[8].id,
            "author_names": "Isabella Rossi, Bob Smith",
            "subject": "Optimization",
            "keywords": "Evolutionary Algorithms",
        },
        {
            "title": "Large Language Models for Biomedical Text Mining",
            "content": (
                "Large language models enable automated extraction of structured knowledge from biomedical "
                "literature. By processing vast corpora of scientific text, these models identify entities, "
                "relationships, and hypotheses, supporting literature review, knowledge discovery, and "
                "clinical research synthesis."
            ),
            "published_journal": "BioNLP",
            "published_date": date(2024, 6, 1),
            "corresponding_author_id": authors[9].id,
            "author_names": "John Miller, Alice Zhang",
            "subject": "Natural Language Processing",
            "keywords": "LLM, Biomedical NLP",
        },
        {
            "title": "High-Performance Computing for Genomic Alignment",
            "content": (
                "Genomic alignment tasks require substantial computational resources due to massive sequence "
                "datasets. High-performance computing techniques parallelize alignment algorithms across "
                "distributed architectures, significantly reducing runtime and enabling population-scale "
                "genomic analysis."
            ),
            "published_journal": "HPC Biology",
            "published_date": date(2023, 8, 22),
            "corresponding_author_id": authors[5].id,
            "author_names": "Frank Müller, David Wong",
            "subject": "High Performance Computing",
            "keywords": "HPC, Genomics",
        },
        {
            "title": "Causal Inference in Biological Networks",
            "content": (
                "Causal inference methods uncover directional relationships within biological networks by "
                "distinguishing correlation from causation. These approaches support analysis of gene "
                "regulatory systems, signaling pathways, and intervention effects in complex biological "
                "processes."
            ),
            "published_journal": "Systems Biology",
            "published_date": date(2024, 2, 25),
            "corresponding_author_id": authors[6].id,
            "author_names": "Grace Kim, Carol Lee",
            "subject": "Systems Biology",
            "keywords": "Causality",
        },
        {
            "title": "Federated Learning for Medical Data",
            "content": (
                "Federated learning enables collaborative model training across institutions without sharing "
                "raw patient data. By aggregating decentralized updates, this paradigm preserves privacy, "
                "supports regulatory compliance, and improves robustness of medical machine learning models."
            ),
            "published_journal": "Health Informatics",
            "published_date": date(2024, 3, 9),
            "corresponding_author_id": authors[4].id,
            "author_names": "Eve Chen, Bob Smith",
            "subject": "Machine Learning",
            "keywords": "Federated Learning",
        },
        {
            "title": "Simulation-Based Drug Discovery",
            "content": (
                "Simulation-based drug discovery employs molecular dynamics and statistical mechanics to "
                "evaluate candidate compounds before experimental validation. Computational screening "
                "reduces development costs, prioritizes promising molecules, and accelerates early-stage "
                "pharmaceutical research."
            ),
            "published_journal": "Drug Design",
            "published_date": date(2023, 10, 18),
            "corresponding_author_id": authors[8].id,
            "author_names": "Isabella Rossi, Frank Müller",
            "subject": "Computational Chemistry",
            "keywords": "Simulation",
        },
        {
            "title": "Multi-Scale Modeling of Cellular Processes",
            "content": (
                "Multi-scale modeling integrates molecular, cellular, and tissue-level representations to "
                "study complex biological processes. By linking phenomena across spatial and temporal scales, "
                "these models improve understanding of cellular behavior, signaling dynamics, and system "
                "robustness."
            ),
            "published_journal": "Cell Systems",
            "published_date": date(2024, 4, 21),
            "corresponding_author_id": authors[7].id,
            "author_names": "Hiro Tanaka, Alice Zhang",
            "subject": "Cell Biology",
            "keywords": "Multi-scale Modeling",
        },
    ]

    articles = [Article(**data) for data in articles_data]
    db.add_all(articles)
    db.commit()
    for art in articles:
        db.refresh(art)

    # ======================================================
    # AuthorArticle links (many-to-many, cyclic & dense)
    # ======================================================
    author_cycle = cycle(authors)

    links = []
    for art in articles:
        # each article has 2–3 authors
        for _ in range(3):
            author = next(author_cycle)
            links.append(
                AuthorArticle(article_id=art.id, author_id=author.id)
            )

    db.add_all(links)
    db.commit()

    # ======================================================
    # References
    # Each article cites 3 others (ring + cross-links)
    # ======================================================
    references = []
    n = len(articles)

    for i, art in enumerate(articles):
        targets = [
            articles[(i + 1) % n],
            articles[(i + 2) % n],
            articles[(i + 5) % n],
        ]

        for j, target in enumerate(targets):
            references.append(
                Reference(
                    cited_from_id=art.id,
                    cited_to_id=target.id,
                    if_key_reference=(j == 0),
                    if_secondary_reference=(j == 1),
                    citation_content=f"Cites concepts from {target.title}",
                    content=f"Relationship between {art.title} and {target.title}",
                )
            )

    db.add_all(references)
    db.commit()

    print("✅ Database seeded successfully!")
    print("   • Authors: 10")
    print("   • Articles: 15")
    print("   • Citations: ≥3 per article")
    print("   • Subjects: Computer Science & Biology")


if __name__ == "__main__":
    seed()