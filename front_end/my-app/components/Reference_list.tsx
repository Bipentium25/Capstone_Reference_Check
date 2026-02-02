// components/ReferenceList.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useUserStore } from "@/app/store/userStore"
import styles from "./ReferenceList.module.css"

interface Reference {
  id: number
  cited_to_id: number
  cited_from_id: number
  cited_to_title: string
  cited_from_title: string
  if_key_reference: boolean
  if_secondary_reference: boolean
  citation_content: string
  ai_rated_score: number
  feedback: string
  author_comment: string
}

interface ReferenceListProps {
    articleId: number
    correspondingAuthorId: number  // ← NEW: Pass from article page
    }

    export default function ReferenceList({ articleId, correspondingAuthorId }: ReferenceListProps) {
    const { user } = useUserStore()  // ← NEW: Get current user
    const [references, setReferences] = useState<Reference[]>([])
    const [filteredReferences, setFilteredReferences] = useState<Reference[]>([])
    const [showOnlyKey, setShowOnlyKey] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // ← NEW: Check if current user is the article author

    const isArticleAuthor = user && user.id === correspondingAuthorId
    

    /* ---------------- Fetch references ---------------- */
    useEffect(() => {
        async function fetchReferences() {
        try {
            setIsLoading(true)
            setError(null)

            const res = await fetch(
            `https://capstone-reference-check.onrender.com/references/from/${articleId}`
            )

            if (!res.ok) {
            throw new Error("Failed to load references")
            }

            const data = await res.json()
            setReferences(data)
            setFilteredReferences(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error")
        } finally {
            setIsLoading(false)
        }
        }

        fetchReferences()
    }, [articleId])

    /* ---------------- Filter logic ---------------- */
    useEffect(() => {
        if (showOnlyKey) {
        setFilteredReferences(references.filter((ref) => ref.if_key_reference))
        } else {
        setFilteredReferences(references)
        }
    }, [showOnlyKey, references])

    /* ---------------- Helpers ---------------- */
    const scoreClass = (score: number) => {
        if (score >= 8) return "bg-green-100 text-green-800"
        if (score >= 5) return "bg-yellow-100 text-yellow-800"
        return "bg-red-100 text-red-800"
    }

    /* ---------------- States ---------------- */
    if (isLoading) {
        return (
        <div className={styles.card}>
            <h2 className="text-xl font-semibold">References</h2>
            <p className="mt-2 text-gray-500">Loading references…</p>
        </div>
        )
    }

    if (error) {
        return (
        <div className={styles.card} style={{ borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}>
            <h2 className="text-xl font-semibold text-red-900">References</h2>
            <p className="mt-2 text-red-700">{error}</p>
        </div>
        )
    }

    if (references.length === 0) {
        return (
        <div className={styles.card}>
            <h2 className="text-xl font-semibold">References</h2>
            <p className="mt-2 text-gray-500">No references found for this article.</p>
        </div>
        )
    }

    /* ---------------- Render ---------------- */
    return (
        <div className={styles.card}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
            <h2 className="text-2xl font-semibold text-gray-900">References</h2>
            <p className="mt-1 text-sm text-gray-500">
                {filteredReferences.length} {showOnlyKey ? "key" : "total"} reference
                {filteredReferences.length !== 1 ? "s" : ""}
            </p>
            </div>

            <label className="flex cursor-pointer items-center gap-2">
            <input
                type="checkbox"
                checked={showOnlyKey}
                onChange={(e) => setShowOnlyKey(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'normal' }}>
                Show only key references
            </span>
            </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className={styles.table}>
            <thead>
            <tr>
                <th className={styles.th}>Ref ID</th>
                <th className={styles.th}>Article</th>
                <th className={styles.th}>Citation Context</th>
                <th className={styles.th}>AI Score</th>
                <th className={styles.th}>Citation Feedback</th>
                <th className={styles.th}>Author Comment</th>
                {isArticleAuthor && <th className={styles.th}>Actions</th>}
            </tr>
            </thead>

            <tbody>
                {filteredReferences.map((ref) => (
                <tr key={ref.id} className={styles.row}>
                    {/* Ref ID */}
                    <td className={styles.td}>
                    <div className="font-mono font-semibold">{ref.cited_to_id}</div>
                    <div className="mt-1 flex flex-col gap-1">
                        {ref.if_key_reference && (
                        <span className={`${styles.badge} ${styles.key}`}>🔑 Key</span>
                        )}
                        {ref.if_secondary_reference && (
                        <span className={`${styles.badge} ${styles.secondary}`}>⚠️ Secondary</span>
                        )}
                    </div>
                    </td>

                    {/* Article Title */}
                    <td className={styles.td}>
                    <Link
                        href={`/articles/${ref.cited_to_id}`}
                        className="font-medium text-blue-600 hover:underline"
                    >
                        {ref.cited_to_title}
                    </Link>
                    </td>

                    {/* Citation Context */}
                    <td className={`${styles.td} ${styles.muted}`}>
                    {ref.citation_content ? `"${ref.citation_content}"` : "No context"}
                    </td>

                    {/* AI Score */}
                    <td className={styles.td}>
                    {ref.ai_rated_score !== null ? (
                        <span className={`${styles.score} ${scoreClass(ref.ai_rated_score)}`}>
                        {ref.ai_rated_score}/10
                        </span>
                    ) : (
                        <span className="text-gray-400 text-sm">Not rated</span>
                    )}
                    </td>

                    {/* Citation Feedback */}
                    <td className={`${styles.td} ${styles.muted}`}>
                    {ref.feedback || "No feedback"}
                    </td>

                    {/* Author Comment */}
                    <td className={`${styles.td} ${styles.muted}`}>
                    {ref.author_comment || "No comment"}
                    </td>

                    {/* ← NEW: Actions Column (only for article author) */}
                    {isArticleAuthor && (
                    <td className={styles.td}>
                        <Link
                        href={`/articles/${articleId}/reference/${ref.id}/feedback`}
                        className={styles.actionLink}
                        >
                        {ref.author_comment ? "✓ View" : "💬 Comment"}
                        </Link>
                    </td>
                    )}
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {/* Empty after filter */}
        {filteredReferences.length === 0 && references.length > 0 && (
            <div className="mt-6 rounded-lg bg-gray-100 p-6 text-center">
            <p className="text-gray-600">No key references found.</p>
            <button
                onClick={() => setShowOnlyKey(false)}
                className="mt-2 text-blue-600 hover:underline"
            >
                Show all {references.length} reference{references.length !== 1 ? "s" : ""}
            </button>
            </div>
        )}
        </div>
    )
    }