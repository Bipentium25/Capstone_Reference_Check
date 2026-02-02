// app/articles/[id]/submit_references/page.tsx
"use client"

import { useState, FormEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import styles from "./SubmitReferences.module.css"

interface Reference {
    cited_to_id: string  // ← Changed: This is the article being cited
    if_key_reference: boolean
    if_secondary_reference: boolean
    citation_content: string
    }

    export default function SubmitReferencesPage() {
    const params = useParams()
    const router = useRouter()
    const articleId = params.id as string
    
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    
    // References list (starts with one empty reference)
    const [references, setReferences] = useState<Reference[]>([
        {
        cited_to_id: "",  // ← Changed
        if_key_reference: false,
        if_secondary_reference: false,
        citation_content: "",
        }
    ])
    
    // Handle reference field changes
    const handleReferenceChange = (
        index: number, 
        field: keyof Reference, 
        value: string | boolean
    ) => {
        const newReferences = [...references]
        newReferences[index] = {
        ...newReferences[index],
        [field]: value
        }
        setReferences(newReferences)
    }
    
    // Add new reference
    const addReference = () => {
        setReferences([
        ...references, 
        {
            cited_to_id: "",  // ← Changed
            if_key_reference: false,
            if_secondary_reference: false,
            citation_content: "",
        }
        ])
    }
    
    // Remove reference
    const removeReference = (index: number) => {
        if (references.length > 1) {
        const newReferences = references.filter((_, i) => i !== index)
        setReferences(newReferences)
        }
    }
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(null)
        
        try {
        // Filter out empty references
        const validReferences = references.filter(ref => ref.cited_to_id.trim() !== "")
        
        if (validReferences.length === 0) {
            throw new Error("At least one reference is required")
        }
        
        console.log("Submitting references for article:", articleId)
        
        // Submit each reference
        const results = []
        
        for (const ref of validReferences) {
            const payload = {
            cited_from_id: parseInt(articleId),  // ← Your NEW article (doing the citing)
            cited_to_id: parseInt(ref.cited_to_id),  // ← The article being cited
            content: ref.citation_content.trim() || `Citation to article ${ref.cited_to_id}`,
            if_key_reference: ref.if_key_reference,
            if_secondary_reference: ref.if_secondary_reference,
            citation_content: ref.citation_content.trim() || null,
            ai_rated_score: null,
            feedback: null,
            author_comment: null,
            }
            
            console.log("Submitting reference:", payload)
            
            try {
            const response = await fetch(
                "https://capstone-reference-check.onrender.com/references/",
                {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
                }
            )
            
            console.log("Response status:", response.status)
            
            if (!response.ok) {
                const errorData = await response.json()
                console.error("Error response:", errorData)
                throw new Error(errorData.detail || `Failed to submit reference to article ${ref.cited_to_id}`)
            }
            
            const data = await response.json()
            console.log("Reference created:", data)
            results.push(data)
            } catch (err) {
            console.error("Error submitting reference:", err)
            throw err
            }
        }
        
        setSuccess(`Successfully submitted ${results.length} reference(s)!`)
        
        // Redirect to article after 2 seconds
        setTimeout(() => {
            router.push(`/articles/${articleId}`)
        }, 2000)
        
        } catch (err) {
        console.error("Submission error:", err)
        setError(err instanceof Error ? err.message : "Failed to submit references")
        } finally {
        setIsLoading(false)
        }
    }
    
    const handleSkip = () => {
        router.push(`/articles/${articleId}`)
    }
    
    return (
        <div className={styles.container}>
        <div className={styles.header}>
            <h1 className={styles.title}>Submit References</h1>
            <p className={styles.subtitle}>
            Add citations for your article (Article ID: {articleId})
            </p>
        </div>
        
        {success && (
            <div className={styles.success}>
            <p>{success}</p>
            <p className={styles.redirectMsg}>Redirecting to your article...</p>
            </div>
        )}
        
        {error && (
            <div className={styles.error}>
            <p>{error}</p>
            </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
            {/* References Section */}
            <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>References</h2>
            <button
                type="button"
                onClick={addReference}
                className={styles.addBtn}
            >
                + Add Reference
            </button>
            </div>
            
            <div className={styles.referencesList}>
            {references.map((reference, index) => (
                <div key={index} className={styles.referenceCard}>
                <div className={styles.cardHeader}>
                    <span className={styles.refNumber}>Reference #{index + 1}</span>
                    {references.length > 1 && (
                    <button
                        type="button"
                        onClick={() => removeReference(index)}
                        className={styles.removeBtn}
                    >
                        ✕ Remove
                    </button>
                    )}
                </div>
                
                {/* Article Being Cited */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                    Article ID You're Citing *
                    </label>
                    <input
                    type="number"
                    value={reference.cited_to_id}
                    onChange={(e) => handleReferenceChange(index, 'cited_to_id', e.target.value)}
                    placeholder="e.g., 20"
                    className={styles.input}
                    required
                    />
                    <small className={styles.hint}>
                    Enter the ID of the article you are citing in your paper
                    </small>
                </div>
                
                {/* Citation Content */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                    Citation Context
                    </label>
                    <textarea
                    value={reference.citation_content}
                    onChange={(e) => handleReferenceChange(index, 'citation_content', e.target.value)}
                    placeholder="Quote or context where this reference appears in your article..."
                    rows={3}
                    className={styles.textarea}
                    />
                    <small className={styles.hint}>
                    Optional: The specific quote or context from your article
                    </small>
                </div>
                
                {/* Checkboxes */}
                <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={reference.if_key_reference}
                        onChange={(e) => handleReferenceChange(index, 'if_key_reference', e.target.checked)}
                        className={styles.checkbox}
                    />
                    <span>Key Reference</span>
                    <small className={styles.checkboxHint}>
                        This is a foundational or critical citation
                    </small>
                    </label>
                    
                    <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={reference.if_secondary_reference}
                        onChange={(e) => handleReferenceChange(index, 'if_secondary_reference', e.target.checked)}
                        className={styles.checkbox}
                    />
                    <span>Secondary Reference</span>
                    <small className={styles.checkboxHint}>
                        This is cited indirectly (not from original source)
                    </small>
                    </label>
                </div>
                </div>
            ))}
            </div>
            
            {/* Submit Buttons */}
            <div className={styles.actions}>
            <button
                type="submit"
                disabled={isLoading}
                className={styles.submitBtn}
            >
                {isLoading ? "Submitting..." : "Submit References"}
            </button>
            <button
                type="button"
                onClick={handleSkip}
                disabled={isLoading}
                className={styles.skipBtn}
            >
                Skip for Now
            </button>
            </div>
        </form>
        </div>
    )
    }