// components/sidebar/UserInfo.tsx
"use client"

import { useState, FormEvent } from "react"
import { useUserStore } from "@/app/store/userStore"
import Link from "next/link"

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
        
        // Clear form fields after successful login
        setEmail("")
        setPassword("")
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
        <div className="space-y-3">
            <div className="rounded bg-gray-50 p-3">
            <p className="font-semibold">Welcome, {user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            {user.institute && (
                <p className="text-sm text-gray-600">{user.institute}</p>
            )}
            {user.job && (
                <p className="text-sm text-gray-600">{user.job}</p>
            )}
            </div>

            {/* Link to Profile Page */}
            <Link
            href="/user/myprofile"
            className="block w-full rounded bg-blue-600 py-2 text-center text-white hover:bg-blue-700"
            >
            View My Profile
            </Link>

            {user.articles && user.articles.length > 0 && (
            <div>
                <h4 className="mb-2 font-semibold">Your Articles:</h4>
                <ul className="space-y-1">
                {user.articles.map((a) => (
                    <li key={a.id}>
                    <Link
                        href={`/articles/${a.id}`}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        {a.title}
                    </Link>
                    </li>
                ))}
                </ul>
            </div>
            )}

            <button
            onClick={logout}
            className="w-full rounded bg-red-600 py-2 text-white hover:bg-red-700"
            >
            Log out
            </button>
        </div>
        )
    }

    // login form view
    return (
        <form onSubmit={handleLogin} className="space-y-3">
        <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
        />
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
        />
        <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
            Log in
        </button>
        {error && (
            <p className="text-sm text-red-600">{error}</p>
        )}
        </form>
    )
    }