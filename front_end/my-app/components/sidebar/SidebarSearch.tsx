// components/sidebar/SidebarSearch.tsx
"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import styles from "./SidebarSearch.module.css"

type SearchType = "title" | "subject" | "keyword" | "article_id"

export default function SidebarSearch() {
    const router = useRouter()
    const [searchType, setSearchType] = useState<SearchType>("title")
    const [query, setQuery] = useState("")

    const handleSearch = (e: FormEvent) => {
        e.preventDefault()
        
        if (!query.trim()) return
        
        // Build URL based on search type
        if (searchType === "article_id") {
        // Direct navigation to article
        router.push(`/articles/${query.trim()}`)
        } else {
        // Navigate to search results with appropriate query param
        router.push(`/articles/search_result?${searchType}=${encodeURIComponent(query.trim())}`)
        }
        
        // Clear search after submitting
        setQuery("")
    }

    const getPlaceholder = () => {
        switch (searchType) {
        case "title":
            return "e.g., Quantum Computing"
        case "subject":
            return "e.g., Physics"
        case "keyword":
            return "e.g., AI, Machine Learning"
        case "article_id":
            return "e.g., 23"
        default:
            return "Enter search query..."
        }
    }

    return (
        <form onSubmit={handleSearch} className={styles.searchContainer}>
        <h3 className={styles.searchTitle}>Search Articles</h3>
        
        <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className={styles.selectField}
        >
            <option value="title">Article Title</option>
            <option value="subject">Subject</option>
            <option value="keyword">Keywords</option>
            <option value="article_id">Article ID</option>
        </select>

        <input
            type="text"
            placeholder={getPlaceholder()}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.inputField}
        />

        {searchType === "keyword" && (
            <small className={styles.hint}>
            Separate multiple keywords with commas
            </small>
        )}

        <button
            type="submit"
            className={styles.searchBtn}
            disabled={!query.trim()}
        >
            Search
        </button>
        </form>
    )
    }