"use client"

import { create } from 'zustand'

export type SearchType = "author" | "title" | "article_id"

interface Article {  // ← Changed from Single_Article
    id: number
    title: string
    content: string
    published_journal: string
    published_date: string
    corresponding_author_id: number
    author_names: string[]
    author_ids: number[]
    }

    interface SearchStore {  // ← Changed from List_of_Artilces
    searchType: SearchType
    query: string
    results: Article[]
    isLoading: boolean
    error: string | null
    
    setSearchType: (type: SearchType) => void
    setQuery: (query: string) => void
    performSearch: (type: SearchType, query: string) => Promise<void>
    clearResults: () => void
    }

    export const useSearchStore = create<SearchStore>((set, get) => ({
    searchType: "title",
    query: "",
    results: [],
    isLoading: false,
    error: null,

    setSearchType: (type) => set({ searchType: type }),
    
    setQuery: (query) => set({ query }),

    performSearch: async (type, query) => {
        set({ isLoading: true, error: null })
        
        try {
        let url = ""
        
        if (type === "author") {
            url = `https://capstone-reference-check.onrender.com/articles/search/author?q=${encodeURIComponent(query)}`
        } else if (type === "title") {
            url = `https://capstone-reference-check.onrender.com/articles/search/title?q=${encodeURIComponent(query)}`
        } else if (type === "article_id") {
            url = `https://capstone-reference-check.onrender.com/articles/${query}`
        }
        
        const response = await fetch(url)
        
        if (!response.ok) {
            throw new Error('Article not found')
        }
        
        const data = await response.json()
        const results = type === 'article_id' ? [data] : data
        
        set({ results, isLoading: false })
        } catch (err) {
        set({ 
            error: err instanceof Error ? err.message : 'Search failed',
            isLoading: false,
            results: []
        })
        }
    },

    clearResults: () => set({ results: [], error: null, query: "" }),
    }))