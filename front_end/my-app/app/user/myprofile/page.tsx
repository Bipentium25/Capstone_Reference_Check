"use client"

import { useState } from "react"
import { useUserStore } from "@/app/store/userStore"
import { useRouter } from "next/navigation"
import Link from "next/link"
import styles from "./MyProfile.module.css"

export default function MyProfilePage() {
    const { user, setUser } = useUserStore()
    const router = useRouter()

    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [emailStatus, setEmailStatus] = useState<
        "idle" | "checking" | "available" | "taken"
    >("idle")

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        institute: user?.institute || "",
        job: user?.job || "",
    })

    if (!user) {
        return (
        <div className={styles.container}>
            <div className={styles.error}>Please log in to view your profile.</div>
        </div>
        )
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (e.target.name === "email") setEmailStatus("idle")
    }

    const checkEmailAvailability = async () => {
        if (!formData.email || formData.email === user.email) return
        setEmailStatus("checking")
        setError(null)

        try {
        const res = await fetch(
            `https://capstone-reference-check.onrender.com/authors/by-email`,
            {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email }),
            }
        )

        if (!res.ok) {
            if (res.status === 404) setEmailStatus("available")
            else throw new Error("Email check failed")
        } else {
            const data = await res.json()
            const status = data.id === user.id ? "available" : "taken"
            setEmailStatus(status)
            if (status === "taken") setError("This email is already taken")
        }
        } catch (err) {
        console.error(err)
        setEmailStatus("idle")
        setError("Failed to verify email availability")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.password.trim()) {
        setError("Password is required to update your profile")
        return
        }
        if (emailStatus === "taken") {
        setError("This email is already in use")
        return
        }

        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
        const payload = {
            name: formData.name || null,
            email: formData.email || null,
            password: formData.password,
            institute: formData.institute || null,
            job: formData.job || null,
        }

        const res = await fetch(
            `https://capstone-reference-check.onrender.com/authors/${user.id}`,
            {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            }
        )

        if (!res.ok) {
            const errData = await res.json()
            throw new Error(errData.detail || "Failed to update profile")
        }

        const updatedUser = await res.json()
        setUser(updatedUser)
        setSuccess("Profile updated successfully!")
        setIsEditing(false)
        setEmailStatus("idle")
        setFormData({ ...formData, password: "" })
        } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update profile")
        } finally {
        setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setError(null)
        setSuccess(null)
        setEmailStatus("idle")
        setFormData({
        name: user.name,
        email: user.email,
        password: "",
        institute: user.institute || "",
        job: user.job || "",
        })
    }

    return (
        <div className={styles.container}>
        <div className={styles.header}>
            <h1 className={styles.title}>My Profile</h1>
        </div>

        {success && <div className={styles.success}>{success}</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!isEditing ? (
            <div className={styles.card}>
            <div className={styles.infoList}>
                <div className={styles.infoRow}>
                <span className={styles.label}>Name:</span>
                <span className={styles.value}>{user.name || "-"}</span>
                </div>
                <div className={styles.infoRow}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{user.email || "-"}</span>
                </div>
                <div className={styles.infoRow}>
                <span className={styles.label}>Institute:</span>
                <span className={styles.value}>{user.institute || "-"}</span>
                </div>
                <div className={styles.infoRow}>
                <span className={styles.label}>Job/Position:</span>
                <span className={styles.value}>{user.job || "-"}</span>
                </div>
                <div className={styles.infoRow}>
                <span className={styles.label}>User ID:</span>
                <span className={styles.value}>{user.id}</span>
                </div>
            </div>

            {user.articles && user.articles.length > 0 && (
                <div className={styles.articleList}>
                <h3>My Articles</h3>
                <ul>
                    {user.articles.map((a) => (
                    <li key={a.id}>
                        <Link href={`/articles/${a.id}`}>{a.title}</Link>
                    </li>
                    ))}
                </ul>
                </div>
            )}

            <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => setIsEditing(true)}
                style={{ marginTop: "16px" }}
            >
                Edit My Info
            </button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className={styles.card}>
            <div className={styles.formGroup}>
                <label>Name</label>
                <input name="name" value={formData.name} onChange={handleChange} />
            </div>

            <div className={styles.formGroup}>
                <label>Email</label>
                <div className={styles.emailCheckRow}>
                <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <button
                    type="button"
                    onClick={checkEmailAvailability}
                    className={styles.secondaryBtn}
                    disabled={emailStatus === "checking"}
                >
                    {emailStatus === "checking" ? "Checking…" : "Check"}
                </button>
                </div>
                {emailStatus === "available" && (
                <small className={styles.success}>✓ Email is available</small>
                )}
                {emailStatus === "taken" && (
                <small className={styles.error}>✕ Email already in use</small>
                )}
            </div>

            <div className={styles.formGroup}>
                <label>Institute</label>
                <input
                name="institute"
                value={formData.institute}
                onChange={handleChange}
                />
            </div>

            <div className={styles.formGroup}>
                <label>Job/Position</label>
                <input name="job" value={formData.job} onChange={handleChange} />
            </div>

            <div className={styles.formGroup}>
                <label>Password *</label>
                <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password to confirm changes"
                required
                />
            </div>

            <div className={styles.actions}>
                <button type="submit" className={styles.primaryBtn}>
                {isLoading ? "Saving…" : "Save Changes"}
                </button>
                <button
                type="button"
                onClick={handleCancel}
                className={styles.secondaryBtn}
                >
                Cancel
                </button>
            </div>
            </form>
        )}
        </div>
    )
    }