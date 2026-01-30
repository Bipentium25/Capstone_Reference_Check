// app/articles/new/page.tsx
"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/app/store/userStore"
import styles from "./NewArticle.module.css"

interface Author {
    name: string
    email: string
    }

    export default function NewArticlePage() {
    const router = useRouter()
    const user = useUserStore((state) => state.user)
    
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    
    // Author list state (starts with current user)
    const [authors, setAuthors] = useState<Author[]>([
        { name: user?.name || "", email: user?.email || "" }
    ])
    
    // Form state
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        published_journal: "",
        published_date: "",
        subject: "",
        keywords: "",
        corresponding_author_email: user?.email || "",
    })
    
    // Redirect if not logged in
    if (!user) {
        return (
        <div className={styles.container}>
            <div className={styles.error}>
            <h2>Authentication Required</h2>
            <p>Please log in to submit a new article.</p>
            <button onClick={() => router.push("/")} className={styles.primaryBtn}>
                Go to Home
            </button>
            </div>
        </div>
        )
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        })
    }
    
    // Handle author field changes
    const handleAuthorChange = (index: number, field: 'name' | 'email', value: string) => {
        const newAuthors = [...authors]
        newAuthors[index][field] = value
        setAuthors(newAuthors)
    }
    
    // Add new author
    const addAuthor = () => {
        setAuthors([...authors, { name: "", email: "" }])
    }
    
    // Remove author
    const removeAuthor = (index: number) => {
        if (authors.length > 1) {
        const newAuthors = authors.filter((_, i) => i !== index)
        setAuthors(newAuthors)
        }
    }
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(null)
        
        try {
        // Validate required fields
        if (!formData.title.trim()) {
            throw new Error("Title is required")
        }
        if (!formData.content.trim()) {
            throw new Error("Content is required")
        }
        if (!formData.corresponding_author_email.trim()) {
            throw new Error("Corresponding author email is required")
        }
        
        // Validate at least one author with a name
        const validAuthors = authors.filter(a => a.name.trim() !== "")
        if (validAuthors.length === 0) {
            throw new Error("At least one author name is required")
        }
        
        // Parse keywords
        const keywords = formData.keywords
            .split(",")
            .map(k => k.trim())
            .filter(k => k.length > 0)
        
        // Build author arrays
        const author_names = validAuthors.map(a => a.name.trim())
        const author_emails = validAuthors.map(a => 
            a.email.trim() === "" || a.email.toLowerCase() === "none" ? null : a.email.trim()
        )
        
        // Build payload
        const payload = {
            title: formData.title,
            content: formData.content,
            published_journal: formData.published_journal || "N/A",
            published_date: formData.published_date || new Date().toISOString().split('T')[0],
            subject: formData.subject || "General",
            keywords: keywords,
            corresponding_author_email: formData.corresponding_author_email,
            author_names: author_names,
            author_emails: author_emails,
        }
        
        console.log("Submitting article:", payload)
        
        const response = await fetch(
            "https://capstone-reference-check.onrender.com/articles/",
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            }
        )
        
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.detail || "Failed to create article")
        }
        
        const newArticle = await response.json()
        console.log("Article created:", newArticle)
        
        setSuccess("Article submitted successfully!")
        
        // Redirect to the new article after 2 seconds
        setTimeout(() => {
            router.push(`/articles/${newArticle.id}`)
        }, 2000)
        
        } catch (err) {
        console.error("Submission error:", err)
        setError(err instanceof Error ? err.message : "Failed to submit article")
        } finally {
        setIsLoading(false)
        }
    }
    
    return (
        <div className={styles.container}>
        <div className={styles.header}>
            <button onClick={() => router.back()} className={styles.backBtn}>
            ← Back
            </button>
            <h1 className={styles.title}>Submit New Article</h1>
            <p className={styles.subtitle}>
            Share your research with the academic community
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
            {/* Title */}
            <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
                Article Title *
            </label>
            <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Quantum Computing Applications in Machine Learning"
                className={styles.input}
            />
            </div>
            
            {/* Content */}
            <div className={styles.formGroup}>
            <label htmlFor="content" className={styles.label}>
                Article Content *
            </label>
            <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={12}
                placeholder="Enter your article content here..."
                className={styles.textarea}
            />
            </div>
            
            {/* Published Journal */}
            <div className={styles.formGroup}>
            <label htmlFor="published_journal" className={styles.label}>
                Published Journal
            </label>
            <input
                type="text"
                id="published_journal"
                name="published_journal"
                value={formData.published_journal}
                onChange={handleChange}
                placeholder="e.g., Nature, Science, IEEE Transactions"
                className={styles.input}
            />
            </div>
            
            {/* Published Date */}
            <div className={styles.formGroup}>
            <label htmlFor="published_date" className={styles.label}>
                Published Date
            </label>
            <input
                type="date"
                id="published_date"
                name="published_date"
                value={formData.published_date}
                onChange={handleChange}
                className={styles.input}
            />
            <small className={styles.hint}>Leave blank to use today's date</small>
            </div>
            
            {/* Subject */}
            <div className={styles.formGroup}>
            <label htmlFor="subject" className={styles.label}>
                Subject
            </label>
            <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Physics, Computer Science, Biology"
                className={styles.input}
            />
            </div>
            
            {/* Keywords */}
            <div className={styles.formGroup}>
            <label htmlFor="keywords" className={styles.label}>
                Keywords
            </label>
            <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="e.g., Quantum Computing, AI, Machine Learning"
                className={styles.input}
            />
            <small className={styles.hint}>Separate multiple keywords with commas</small>
            </div>
            
            {/* Corresponding Author Email */}
            <div className={styles.formGroup}>
            <label htmlFor="corresponding_author_email" className={styles.label}>
                Corresponding Author Email *
            </label>
            <input
                type="email"
                id="corresponding_author_email"
                name="corresponding_author_email"
                value={formData.corresponding_author_email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className={styles.input}
            />
            </div>
            
            {/* Authors Section */}
            <div className={styles.formGroup}>
            <div className={styles.sectionHeader}>
                <label className={styles.label}>Authors *</label>
                <button
                type="button"
                onClick={addAuthor}
                className={styles.addBtn}
                >
                + Add Author
                </button>
            </div>
            
            <div className={styles.authorsList}>
                {authors.map((author, index) => (
                <div key={index} className={styles.authorRow}>
                    <div className={styles.authorNumber}>{index + 1}</div>
                    
                    <div className={styles.authorFields}>
                    <input
                        type="text"
                        value={author.name}
                        onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                        placeholder="Author Name"
                        className={styles.input}
                        required={index === 0}
                    />
                    
                    <input
                        type="text"
                        value={author.email}
                        onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                        placeholder="Email (or type 'none')"
                        className={styles.input}
                    />
                    </div>
                    
                    {authors.length > 1 && (
                    <button
                        type="button"
                        onClick={() => removeAuthor(index)}
                        className={styles.removeBtn}
                        title="Remove author"
                    >
                        ✕
                    </button>
                    )}
                </div>
                ))}
            </div>
            
            <small className={styles.hint}>
                First author is required. Type none in email if author has no email.
            </small>
            </div>
            
            {/* Submit Button */}
            <div className={styles.actions}>
            <button
                type="submit"
                disabled={isLoading}
                className={styles.submitBtn}
            >
                {isLoading ? "Submitting..." : "Submit Article"}
            </button>
            <button
                type="button"
                onClick={() => router.back()}
                disabled={isLoading}
                className={styles.cancelBtn}
            >
                Cancel
            </button>
            </div>
        </form>
        </div>
    )
    }