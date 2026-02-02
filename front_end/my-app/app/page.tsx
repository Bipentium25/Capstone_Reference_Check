"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import "./frontpage.css"

export default function HomePage() {
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLuckyArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const url = subject
        ? `https://capstone-reference-check.onrender.com/articles/lucky?subject=${encodeURIComponent(subject)}`
        : `https://capstone-reference-check.onrender.com/articles/lucky`

      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "No articles found")
      }

      const data = await response.json()
      router.push(`/articles/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find article")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="lucky-section">
          <h2>Lucky Article of the day </h2>
          
          <form onSubmit={handleLuckyArticle} className="lucky-form">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject (optional)"
              className="subject-input"
            />
            
            <button 
            type="submit" 
            disabled={isLoading}
            className="lucky-button"
          >
            {isLoading ? "Finding..." : "🎲 I'm Feeling Lucky"}
          </button>
          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}