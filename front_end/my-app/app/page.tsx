'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Subject {
  id: number
  name: string
}

interface Article {
  id: number
  title: string
}

export default function LuckyArticle() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Fetch subjects on load
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await fetch("https://capstone-reference-check.onrender.com/subjects")
        if (!res.ok) throw new Error("Failed to fetch subjects")
        const data = await res.json()
        setSubjects(data)
        if (data.length > 0) setSelectedSubject(data[0].id)
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Failed to load subjects")
      }
    }
    fetchSubjects()
  }, [])

  const handleGoLucky = async () => {
    if (!selectedSubject) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`https://capstone-reference-check.onrender.com/articles?subjectId=${selectedSubject}`)
      if (!res.ok) throw new Error("Failed to fetch articles")
      const articles: Article[] = await res.json()
      if (!articles.length) throw new Error("No articles found for this subject")

      // Pick a random article
      const randomArticle = articles[Math.floor(Math.random() * articles.length)]
      router.push(`/articles/${randomArticle.id}`)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h1 className="text-2xl font-bold mb-4">Lucky Article of the Day 🍀</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block font-semibold mb-1">Choose a subject:</label>
        <select
          value={selectedSubject ?? ""}
          onChange={(e) => setSelectedSubject(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGoLucky}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Finding article..." : "Go Lucky!"}
      </button>
    </div>
  )
}