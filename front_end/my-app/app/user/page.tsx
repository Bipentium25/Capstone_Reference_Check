'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'  // import router

export default function NewUserPage() {
  const router = useRouter()  // initialize router

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        institute: '',
        job: '',
    })

    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
        const res = await fetch(
        "https://capstone-reference-check.onrender.com/authors",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        }
        );

        if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to create user");
        }

        // Success → go back home
        router.push("/?newUser=true"); // pass a query param
    } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "An error occurred");
    }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Create New User</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
            {['name', 'email', 'password', 'institute', 'job'].map((field) => (
            <div key={field}>
                <label className="block font-medium mb-1" htmlFor={field}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                type={field === 'password' ? 'password' : 'text'}
                name={field}
                id={field}
                value={(formData as any)[field]}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
                />
            </div>
            ))}

            <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={status === 'loading'}
            >
            {status === 'loading' ? 'Submitting...' : 'Submit'}
            </button>

            {message && status === 'error' && (
            <p className="mt-2 text-red-600">{message}</p>
            )}
        </form>
        </div>
    )
    }