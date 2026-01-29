"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import styles from "./article.module.css"  // ← Import the CSS Module
import ReferenceList from "@/components/Reference_list"




interface Article {
    id: number
    title: string
    content: string
    published_journal: string
    published_date: string
    corresponding_author_id: number
    author_names: string[]
    author_ids: number[]
    }

export default function ArticlePage() {
    const params = useParams()
    const router = useRouter()
    const articleId = params.id as string
    
    const [article, setArticle] = useState<Article | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    useEffect(() => {
        async function fetchArticle() {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await fetch(
            `https://capstone-reference-check.onrender.com/articles/${articleId}`
            )
            
            if (!response.ok) {
            throw new Error("Article not found")
            }
            
            const data = await response.json()
            setArticle(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load article")
        } finally {
            setIsLoading(false)
        }
        }
        
        fetchArticle()
    }, [articleId])
    
    if (isLoading) {
        return (
        <div className={styles.loading}>
            <div>Loading article...</div>
        </div>
        )
    }
    
    if (error) {
        return (
        <div className={styles.error}>
            <div className={styles.errorBox}>
            <h2 className={styles.errorTitle}>Error</h2>
            <p>{error}</p>
            <button onClick={() => router.back()} className={styles.errorButton}>
                Go Back
            </button>
            </div>
        </div>
        )
    }
    
    if (!article) {
        return (
        <div className={styles.error}>
            <p>Article not found</p>
        </div>
        )
    }
    
    const authors = article.author_names.map((name, index) => ({
        name: name,
        id: article.author_ids[index]
    }))
    
    return (
        <div className={styles.container}>
        <div className={styles.wrapper}>
            
            <button onClick={() => router.back()} className={styles.backButton}>
            <span>← Back</span>
            </button>
            
            <article className={styles.card}>
            
            <div className={styles.header}>
                <h1 className={styles.title}>{article.title}</h1>
                
                <div className={styles.metadata}>
                <div className={styles.metadataRow}>
                    <span className={styles.metadataLabel}>Authors:</span>
                    <span className={styles.metadataValue}>
                    {authors.map((author, index) => (
                        <span key={author.id}>
                        <Link href={`/user/${author.id}`} className={styles.authorLink}>
                            {author.name}
                        </Link>
                        {index < authors.length - 1 && ", "}
                        </span>
                    ))}
                    </span>
                </div>
                
                <div className={styles.metadataRow}>
                    <span className={styles.metadataLabel}>Published in:</span>
                    <span className={styles.metadataValue}>{article.published_journal}</span>
                </div>
                
                <div className={styles.metadataRow}>
                    <span className={styles.metadataLabel}>Published:</span>
                    <span className={styles.metadataValue}>
                    {new Date(article.published_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                    </span>
                </div>
                
                <div className={styles.metadataRow}>
                    <span className={styles.metadataLabel} style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Article ID: {article.id}
                    </span>
                </div>
                </div>
            </div>
            
            <div className={styles.contentSection}>
                <div className={styles.content}>
                {article.content}
                </div>
            </div>
            
            </article>
                    {/* ← ADD REFERENCE LIST HERE */}
            <div className="mt-8">
            <ReferenceList articleId={article.id} />
            </div>
            
            
            <div className={styles.actions}>
            <button onClick={() => router.back()} className={styles.actionButton}>
                Back to Search
            </button>
            </div>
            
        </div>
        </div>
    )
    }