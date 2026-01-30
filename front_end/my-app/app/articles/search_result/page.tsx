// app/articles/search_result/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import styles from "./SearchResult.module.css"

interface Article {
    id: number
    title: string
    content: string
    published_journal: string
    published_date: string
    subject: string
    keywords: string[]
    corresponding_author_id: number
    author_names: string[]
    author_ids: number[]
    }

    export default function SearchResultPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    
    const title = searchParams.get("title")
    const subject = searchParams.get("subject")
    const keyword = searchParams.get("keyword")
    const articleId = searchParams.get("article_id")
    
    const [results, setResults] = useState<Article[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    useEffect(() => {
        if (articleId) {
        router.push(`/articles/${articleId}`)
        return
        }
        
        const params = new URLSearchParams()
        if (title) params.append("title", title)
        if (subject) params.append("subject", subject)
        if (keyword) params.append("keyword", keyword)
        
        if (params.toString() === "") {
        setError("No search parameters provided")
        setIsLoading(false)
        return
        }
        
        async function fetchResults() {
        try {
            setIsLoading(true)
            setError(null)
            
            const url = `https://capstone-reference-check.onrender.com/articles/search?${params.toString()}`
            console.log("Searching:", url)
            
            const response = await fetch(url)
            
            // Check for different error types
            if (!response.ok) {
            if (response.status === 404) {
                // 404 means no results found, not an error
                setResults([])
                setIsLoading(false)
                return
            } else if (response.status >= 500) {
                // Server error
                throw new Error("Server error. Please try again later.")
            } else if (response.status === 400) {
                // Bad request
                throw new Error("Invalid search query. Please check your input.")
            } else {
                // Other errors
                throw new Error("Search failed. Please try again.")
            }
            }
            
            const data = await response.json()
            
            // Handle empty results
            if (Array.isArray(data)) {
            setResults(data)
            } else if (data && typeof data === 'object') {
            setResults([data])
            } else {
            setResults([])
            }
            
        } catch (err) {
            console.error("Search error:", err)
            // Only set error for actual failures, not empty results
            setError(err instanceof Error ? err.message : "Failed to search. Please try again.")
        } finally {
            setIsLoading(false)
        }
        }
        
        fetchResults()
    }, [title, subject, keyword, articleId, router])
    
    const getSearchQuery = () => {
        const parts = []
        if (title) parts.push(`Title: "${title}"`)
        if (subject) parts.push(`Subject: "${subject}"`)
        if (keyword) parts.push(`Keywords: "${keyword}"`)
        return parts.join(", ")
    }
    
    if (isLoading) {
        return (
        <div className={styles.container}>
            <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Searching...</p>
            </div>
        </div>
        )
    }
    
    // Show error only for actual errors (network, server, etc.)
    if (error) {
        return (
        <div className={styles.container}>
            <div className={styles.error}>
            <h2>⚠️ Error</h2>
            <p>{error}</p>
            <button onClick={() => router.back()} className={styles.backBtn}>
                Go Back
            </button>
            </div>
        </div>
        )
    }
    
    return (
        <div className={styles.container}>
        <div className={styles.header}>
            <button onClick={() => router.back()} className={styles.backBtn}>
            ← Back
            </button>
            <h1 className={styles.title}>Search Results</h1>
            <p className={styles.subtitle}>
            {results.length > 0 ? (
                <>
                Found {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
                <span className={styles.query}>{getSearchQuery()}</span>
                </>
            ) : (
                <>
                No results for <span className={styles.query}>{getSearchQuery()}</span>
                </>
            )}
            </p>
        </div>
        
        {/* No results (not an error, just empty) */}
        {results.length === 0 ? (
            <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h2>No Articles Found</h2>
            <p>We couldn't find any articles matching your search criteria.</p>
            <div className={styles.suggestions}>
                <h3>Try:</h3>
                <ul>
                <li>Using different keywords</li>
                <li>Checking your spelling</li>
                <li>Using more general search terms</li>
                <li>Searching by subject or author instead</li>
                </ul>
            </div>
            <button onClick={() => router.back()} className={styles.primaryBtn}>
                Try Another Search
            </button>
            </div>
        ) : (
            <div className={styles.resultsList}>
            {results.map((article) => (
                <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className={styles.resultCard}
                >
                <h2 className={styles.articleTitle}>{article.title}</h2>
                
                <div className={styles.metadata}>
                    <span className={styles.metaItem}>
                    <strong>Authors:</strong> {article.author_names.join(", ")}
                    </span>
                    
                    <span className={styles.metaItem}>
                    <strong>Journal:</strong> {article.published_journal}
                    </span>
                    
                    <span className={styles.metaItem}>
                    <strong>Subject:</strong> {article.subject}
                    </span>
                    
                    {article.keywords && article.keywords.length > 0 && (
                    <span className={styles.metaItem}>
                        <strong>Keywords:</strong> {article.keywords.join(", ")}
                    </span>
                    )}
                    
                    <span className={styles.metaItem}>
                    <strong>Published:</strong>{" "}
                    {new Date(article.published_date).toLocaleDateString()}
                    </span>
                </div>
                
                <div className={styles.readMore}>
                    Read article →
                </div>
                </Link>
            ))}
            </div>
        )}
        </div>
    )
    }