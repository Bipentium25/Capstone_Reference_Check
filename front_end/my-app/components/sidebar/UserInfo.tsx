// components/sidebar/UserInfo.tsx
"use client"

import { useState, FormEvent } from "react"
import { useUserStore } from "@/app/store/userStore"
import Link from "next/link"
import styles from "./UserInfo.module.css"

export default function UserInfo() {
    const { user, setUser, logout } = useUserStore()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    async function handleLogin(e: FormEvent) {
        e.preventDefault()
        setError("")

        try {
        const res = await fetch(
            "https://capstone-reference-check.onrender.com/client/login",
            {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            }
        )

        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.detail || "Login failed")
        }

        const userData = await res.json()
        setUser(userData)
        setEmail("")
        setPassword("")
        } catch (err: unknown) {
        if (err instanceof Error) setError(err.message)
        else setError("An unexpected error occurred")
        }
    }

    if (user) {
        return (
        <div className={styles.userInfoContainer}>
            <div className={styles.userCard}>
            <p className="font-semibold">Welcome, {user.name}</p>
            <p className={styles.info}>{user.email}</p>
            {user.institute && <p className={styles.info}>{user.institute}</p>}
            {user.job && <p className={styles.info}>{user.job}</p>}
            </div>

            <Link href="/user/myprofile" className={styles.primaryBtn}>
            View My Profile
            </Link>

            {user.articles && user.articles.length > 0 && (
            <div className={styles.articleList}>
                <h4 className={styles.sectionTitle}>Your Articles:</h4>
                <ul>
                {user.articles.map((a) => (
                    <li key={a.id}>
                    <Link
                        href={`/articles/${a.id}`}
                        className={styles.articleLink}
                    >
                        {a.title}
                    </Link>
                    </li>
                ))}
                </ul>
            </div>
            )}

            {/* NEW: Submit Article Button */}
            <Link href="/articles/new" className={styles.submitBtn}>
            New Article
            </Link>


            <button onClick={logout} className={styles.logoutBtn}>
            Log out
            </button>
        </div>
        )
    }

    // Login form
    return (
        <form onSubmit={handleLogin} className={styles.userInfoContainer}>
        <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.inputField}
        />
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.inputField}
        />
        <button type="submit" className={styles.primaryBtn}>
            Log in
        </button>

        <Link href="/user/new" className={styles.secondaryBtn}>
            New user
        </Link>

        {error && <p className={styles.errorMsg}>{error}</p>}
        </form>
    )
    }