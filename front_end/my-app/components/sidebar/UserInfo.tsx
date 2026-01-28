// components/sidebar/UserInfo.tsx
"use client"

import { useState, FormEvent } from "react"
import { useUserStore } from "@/app/store/userStore"

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
        setUser(userData) // 👈 Update Zustand store
        } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message)
        } else {
            setError("An unexpected error occurred")
        }
        }
    }

    if (user) {
        // logged in view
        return (
        <div>
            <p>Welcome, {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Institute: {user.institute}</p>
            <p>Job: {user.job}</p>
            <button onClick={logout}>Log out</button> {/* 👈 Use logout */}
            <h4>Your Articles:</h4>
            <ul>
            {user.articles?.map((a) => (
                <li key={a.id}>{a.title}</li>
            ))}
            </ul>
        </div>
        )
    }

    // login form view
    return (
        <form onSubmit={handleLogin}>
        <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />
        <button type="submit">Log in</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
    )
    }