// app/articles/[id]/references/[refId]/feedback/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUserStore } from "@/app/store/userStore"
import Link from "next/link"
import styles from "./Feedback.module.css"

interface Reference {
    id: number
    cited_to_id: number
    cited_from_id: number
    cited_to_title: string
    cited_from_title: string
    if_key_reference: boolean
    if_secondary_reference: boolean
    citation_content: string
    ai_rated_score: number | null
    feedback: string | null
    author_comment: string | null
    }

    interface Article {
    id: number
    title: string
    corresponding_author_id: number
    }

    export default function ReferenceFeedbackPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useUserStore()
    
    const articleId = params.id as string
    const refId = params.refId as string
    
    const [reference, setReference] = useState<Reference | null>(null)
    const [citedToArticle, setCitedToArticle] = useState<Article | null>(null)
    const [citedFromArticle, setCitedFromArticle] = useState<Article | null>(null)
    
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    
    // Form states for referenced author
    const [feedback, setFeedback] = useState("")
    const [ifSecondaryReference, setIfSecondaryReference] = useState(false)
    
    // Form states for citing author
    const [authorComment, setAuthorComment] = useState("")
    const [ifKeyReference, setIfKeyReference] = useState(false)
    
    // Fetch reference and article data
    useEffect(() => {
        async function fetchData() {
        try {
            setIsLoading(true)
            setError(null)
            
            // Fetch reference
            const refResponse = await fetch(
            `https://capstone-reference-check.onrender.com/references/${refId}`
            )
            
            if (!refResponse.ok) {
            throw new Error("Reference not found")
            }
            
            const refData = await refResponse.json()
            setReference(refData)
            
            // Set initial form values
            setFeedback(refData.feedback || "")
            setIfSecondaryReference(refData.if_secondary_reference || false)
            setAuthorComment(refData.author_comment || "")
            setIfKeyReference(refData.if_key_reference || false)
            
            // Fetch cited_to article (the one being cited)
            const citedToResponse = await fetch(
            `https://capstone-reference-check.onrender.com/articles/${refData.cited_to_id}`
            )
            if (citedToResponse.ok) {
            const citedToData = await citedToResponse.json()
            setCitedToArticle(citedToData)
            }
            
            // Fetch cited_from article (the one doing the citing)
            const citedFromResponse = await fetch(
            `https://capstone-reference-check.onrender.com/articles/${refData.cited_from_id}`
            )
            if (citedFromResponse.ok) {
            const citedFromData = await citedFromResponse.json()
            setCitedFromArticle(citedFromData)
            }
            
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load reference")
        } finally {
            setIsLoading(false)
        }
        }
        
        fetchData()
    }, [refId])

        useEffect(() => {
    async function fetchData() {
        try {
        setIsLoading(true)
        setError(null)
        
        console.log("Fetching reference ID:", refId)
        console.log("Article ID:", articleId)
        
        // Fetch reference
        const refResponse = await fetch(
            `https://capstone-reference-check.onrender.com/references/${refId}`
        )
        
        console.log("Reference response status:", refResponse.status)
        
        if (!refResponse.ok) {
            throw new Error("Reference not found")
        }
        
        const refData = await refResponse.json()
        console.log("Reference data:", refData)
        setReference(refData)
        
        // ... rest of fetch logic
        } catch (err) {
        console.error("Fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to load reference")
        } finally {
        setIsLoading(false)
        }
    }
    
    fetchData()
    }, [refId])
    
    // Check if user is referenced author
    const isReferencedAuthor = user && citedToArticle && 
        user.id === citedToArticle.corresponding_author_id
    
    // Check if user is citing author
    const isCitingAuthor = user && citedFromArticle && 
        user.id === citedFromArticle.corresponding_author_id
    
    // Check if sections are editable
    const canEditFeedback = isReferencedAuthor && 
        (!reference?.feedback || reference.feedback.trim() === "")
    
    const canEditComment = isCitingAuthor && 
        (!reference?.author_comment || reference.author_comment.trim() === "")
    
    // Handle feedback submission (referenced author)
    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError(null)
        setSuccess(null)
        
        try {
        const payload = {
            feedback: feedback.trim() || null,
            if_secondary_reference: ifSecondaryReference,
        }
        
        const response = await fetch(
            `https://capstone-reference-check.onrender.com/references/${refId}`,
            {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            }
        )
        
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.detail || "Failed to submit feedback")
        }
        
        const updatedRef = await response.json()
        setReference(updatedRef)
        setSuccess("Feedback submitted successfully!")
        
        // Refresh page after 2 seconds
        setTimeout(() => {
            window.location.reload()
        }, 2000)
        
        } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit feedback")
        } finally {
        setIsSaving(false)
        }
    }
    
    // Handle comment submission (citing author)
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError(null)
        setSuccess(null)
        
        try {
        const payload = {
            author_comment: authorComment.trim() || null,
            if_key_reference: ifKeyReference,
        }
        
        const response = await fetch(
            `https://capstone-reference-check.onrender.com/references/${refId}`,
            {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            }
        )
        
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.detail || "Failed to submit comment")
        }
        
        const updatedRef = await response.json()
        setReference(updatedRef)
        setSuccess("Comment submitted successfully!")
        
        // Refresh page after 2 seconds
        setTimeout(() => {
            window.location.reload()
        }, 2000)
        
        } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit comment")
        } finally {
        setIsSaving(false)
        }
    }
    
    // Redirect if not logged in
    if (!user) {
        return (
        <div className={styles.container}>
            <div className={styles.error}>
            <h2>Authentication Required</h2>
            <p>Please log in to provide feedback.</p>
            <button onClick={() => router.push("/")} className={styles.primaryBtn}>
                Go to Home
            </button>
            </div>
        </div>
        )
    }
    
    if (isLoading) {
        return (
        <div className={styles.container}>
            <div className={styles.loading}>Loading reference details...</div>
        </div>
        )
    }
    
    if (error || !reference) {
        return (
        <div className={styles.container}>
            <div className={styles.error}>
            <h2>Error</h2>
            <p>{error || "Reference not found"}</p>
            <button onClick={() => router.back()} className={styles.backBtn}>
                Go Back
            </button>
            </div>
        </div>
        )
    }
    
    return (
        <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
            <button onClick={() => router.back()} className={styles.backBtn}>
            ← Back
            </button>
            <h1 className={styles.title}>Reference Feedback</h1>
            <p className={styles.subtitle}>Reference ID: {reference.id}</p>
        </div>
        
        {/* Success/Error Messages */}
        {success && (
            <div className={styles.success}>
            <p>{success}</p>
            </div>
        )}
        
        {error && (
            <div className={styles.errorBox}>
            <p>{error}</p>
            </div>
        )}
        
        {/* Reference Details (Always Visible) */}
        <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Reference Details</h2>
            
            <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
                <span className={styles.label}>Article Being Cited:</span>
                <Link href={`/articles/${reference.cited_to_id}`} className={styles.link}>
                {reference.cited_to_title}
                </Link>
            </div>
            
            <div className={styles.infoRow}>
                <span className={styles.label}>Citing Article:</span>
                <Link href={`/articles/${reference.cited_from_id}`} className={styles.link}>
                {reference.cited_from_title}
                </Link>
            </div>
            
            {reference.citation_content && (
                <div className={styles.infoRow}>
                <span className={styles.label}>Citation Context:</span>
                <div className={styles.quoteBox}>
                    "{reference.citation_content}"
                </div>
                </div>
            )}
            
            <div className={styles.infoRow}>
                <span className={styles.label}>AI Quality Score:</span>
                <span className={styles.value}>
                {reference.ai_rated_score !== null 
                    ? `${reference.ai_rated_score}/10` 
                    : "Not rated yet"}
                </span>
            </div>
            </div>
        </div>
        
        {/* Referenced Author's Feedback Section */}
        <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Referenced Author's Feedback</h2>
            <p className={styles.sectionDesc}>
            Feedback from the author of the article being cited
            </p>
            
            {canEditFeedback ? (
            // Editable form
            <form onSubmit={handleFeedbackSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                <label className={styles.formLabel}>Your Feedback</label>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide your assessment of how your work was cited..."
                    rows={4}
                    className={styles.textarea}
                    required
                />
                <small className={styles.hint}>
                    Explain whether this citation accurately represents your work
                </small>
                </div>
                
                <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                    type="checkbox"
                    checked={ifSecondaryReference}
                    onChange={(e) => setIfSecondaryReference(e.target.checked)}
                    className={styles.checkbox}
                    />
                    <span>Mark as Secondary Reference</span>
                    <small className={styles.checkboxHint}>
                    Check this if you believe this citation is indirect or second-hand
                    </small>
                </label>
                </div>
                
                <button 
                type="submit" 
                disabled={isSaving}
                className={styles.submitBtn}
                >
                {isSaving ? "Submitting..." : "Submit Feedback"}
                </button>
            </form>
            ) : isReferencedAuthor ? (
            // Already submitted
            <div className={styles.readOnly}>
                <div className={styles.submittedBadge}>✓ Already Submitted</div>
                
                <div className={styles.formGroup}>
                <label className={styles.formLabel}>Feedback</label>
                <div className={styles.readOnlyText}>
                    {reference.feedback || "No feedback provided"}
                </div>
                </div>
                
                <div className={styles.formGroup}>
                <label className={styles.formLabel}>Secondary Reference</label>
                <div className={styles.badge}>
                    {reference.if_secondary_reference ? "✓ Yes" : "✗ No"}
                </div>
                </div>
            </div>
            ) : (
            // Not the referenced author
            <div className={styles.readOnly}>
                <p className={styles.notAuthorMsg}>
                Only the author of "{reference.cited_to_title}" can edit this section.
                </p>
                
                {reference.feedback ? (
                <>
                    <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Feedback</label>
                    <div className={styles.readOnlyText}>{reference.feedback}</div>
                    </div>
                    
                    <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Secondary Reference</label>
                    <div className={styles.badge}>
                        {reference.if_secondary_reference ? "✓ Yes" : "✗ No"}
                    </div>
                    </div>
                </>
                ) : (
                <p className={styles.pendingMsg}>Feedback pending from author.</p>
                )}
            </div>
            )}
        </div>
        
        {/* Citing Author's Comment Section */}
        <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Citing Author's Comment</h2>
            <p className={styles.sectionDesc}>
            Response from the author who cited the work
            </p>
            
            {canEditComment ? (
            // Editable form
            <form onSubmit={handleCommentSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                <label className={styles.formLabel}>Your Comment</label>
                <textarea
                    value={authorComment}
                    onChange={(e) => setAuthorComment(e.target.value)}
                    placeholder="Defend or explain your use of this reference..."
                    rows={4}
                    className={styles.textarea}
                />
                <small className={styles.hint}>
                    Optional: Explain why and how you used this reference
                </small>
                </div>
                
                <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                    type="checkbox"
                    checked={ifKeyReference}
                    onChange={(e) => setIfKeyReference(e.target.checked)}
                    className={styles.checkbox}
                    />
                    <span>Mark as Key Reference</span>
                    <small className={styles.checkboxHint}>
                    Check this if this is a foundational or critical citation
                    </small>
                </label>
                </div>
                
                <button 
                type="submit" 
                disabled={isSaving}
                className={styles.submitBtn}
                >
                {isSaving ? "Submitting..." : "Submit Comment"}
                </button>
            </form>
            ) : isCitingAuthor ? (
            // Already submitted
            <div className={styles.readOnly}>
                <div className={styles.submittedBadge}>✓ Already Submitted</div>
                
                <div className={styles.formGroup}>
                <label className={styles.formLabel}>Comment</label>
                <div className={styles.readOnlyText}>
                    {reference.author_comment || "No comment provided"}
                </div>
                </div>
                
                <div className={styles.formGroup}>
                <label className={styles.formLabel}>Key Reference</label>
                <div className={styles.badge}>
                    {reference.if_key_reference ? "✓ Yes" : "✗ No"}
                </div>
                </div>
            </div>
            ) : (
            // Not the citing author
            <div className={styles.readOnly}>
                <p className={styles.notAuthorMsg}>
                Only the author of "{reference.cited_from_title}" can edit this section.
                </p>
                
                {reference.author_comment ? (
                <>
                    <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Comment</label>
                    <div className={styles.readOnlyText}>{reference.author_comment}</div>
                    </div>
                    
                    <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Key Reference</label>
                    <div className={styles.badge}>
                        {reference.if_key_reference ? "✓ Yes" : "✗ No"}
                    </div>
                    </div>
                </>
                ) : (
                <p className={styles.pendingMsg}>Comment pending from author.</p>
                )}
            </div>
            )}
        </div>
        </div>
    )
    }