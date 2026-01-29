// app/user/myprofile/page.tsx
"use client"

import { useState } from "react"
import { useUserStore } from "@/app/store/userStore"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function MyProfilePage() {
    const { user, setUser } = useUserStore()
    const router = useRouter()
    
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingEmail, setIsCheckingEmail] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
    
    // Form state
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        institute: user?.institute || "",
        job: user?.job || "",
    })
    
    // If not logged in, redirect or show message
    if (!user) {
        return (
        <div className="p-8">
            <div className="rounded border border-yellow-300 bg-yellow-50 p-4 text-yellow-700">
            Please log in to view your profile.
            </div>
        </div>
        )
    }
    
    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        })
        
        // Reset email validation when email changes
        if (e.target.name === "email") {
        setEmailAvailable(null)
        }
    }
    
    // Check if email is available
    const checkEmailAvailability = async () => {
        // If email hasn't changed, it's available (it's their current email)
        if (formData.email === user.email) {
        setEmailAvailable(true)
        return
        }
        
        // If email is empty, don't check
        if (!formData.email.trim()) {
        setEmailAvailable(null)
        return
        }
        
        setIsCheckingEmail(true)
        setError(null)
        
        try {
        const response = await fetch(
            "https://capstone-reference-check.onrender.com/authors/by-email",
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: formData.email }),
            }
        )
        
        if (response.ok) {
            // Email exists in system
            const existingAuthor = await response.json()
            
            // Check if it's their own email (shouldn't happen, but just in case)
            if (existingAuthor.id === user.id) {
            setEmailAvailable(true)
            } else {
            setEmailAvailable(false)
            setError("This email is already registered to another account")
            }
        } else if (response.status === 404) {
            // Email not found - it's available!
            setEmailAvailable(true)
        } else {
            throw new Error("Failed to check email availability")
        }
        } catch (err) {
        console.error("Email check error:", err)
        setError("Failed to verify email availability")
        setEmailAvailable(null)
        } finally {
        setIsCheckingEmail(false)
        }
    }
    
    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Check if password is provided
        if (!formData.password.trim()) {
        setError("Password is required to update your profile")
        return
        }
        
        // If email changed, verify it's available before submitting
        if (formData.email !== user.email) {
        if (emailAvailable === null) {
            setError("Please check email availability before saving")
            return
        }
        
        if (emailAvailable === false) {
            setError("This email is already taken. Please choose a different email.")
            return
        }
        }
        
        setIsLoading(true)
        setError(null)
        setSuccess(null)
        
        try {
        // Prepare payload
        const payload = {
            name: formData.name || null,
            email: formData.email || null,
            password: formData.password,
            institute: formData.institute || null,
            job: formData.job || null,
        }
        
        console.log("Sending payload:", payload)
        
        const response = await fetch(
            `https://capstone-reference-check.onrender.com/authors/${user.id}`,
            {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            }
        )
        
        if (!response.ok) {
            const errorData = await response.json()
            console.error("Error response:", errorData)
            throw new Error(errorData.detail || "Failed to update profile")
        }
        
        const updatedUser = await response.json()
        console.log("Updated user:", updatedUser)
        
        // Update Zustand store with new data
        setUser(updatedUser)
        
        setSuccess("Profile updated successfully!")
        setIsEditing(false)
        setEmailAvailable(null)
        setFormData({ 
            ...formData, 
            password: "" 
        })
        
        } catch (err) {
        console.error("Error:", err)
        setError(err instanceof Error ? err.message : "Failed to update profile")
        } finally {
        setIsLoading(false)
        }
    }
    
    // Cancel editing
    const handleCancel = () => {
        setIsEditing(false)
        setError(null)
        setSuccess(null)
        setEmailAvailable(null)
        // Reset form to current user data
        setFormData({
        name: user.name,
        email: user.email,
        password: "",
        institute: user.institute || "",
        job: user.job || "",
        })
    }
    
    return (
        <div className="mx-auto max-w-3xl p-8">
        {/* Header */}
        <div className="mb-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
        </div>
        
        {/* Success Message */}
        {success && (
            <div className="mb-4 rounded border border-green-300 bg-green-50 p-4 text-green-700">
            {success}
            </div>
        )}
        
        {/* Error Message */}
        {error && (
            <div className="mb-4 rounded border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
            </div>
        )}
        
        {!isEditing ? (
            // VIEW MODE
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <button
                onClick={() => setIsEditing(true)}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                Edit My Info
                </button>
            </div>
            
            <div className="space-y-4">
                <div>
                <span className="block text-sm font-semibold text-gray-700">Name</span>
                <p className="text-gray-900">{user.name || "Not specified"}</p>
                </div>
                
                <div>
                <span className="block text-sm font-semibold text-gray-700">Email</span>
                <p className="text-gray-900">{user.email || "Not specified"}</p>
                </div>
                
                <div>
                <span className="block text-sm font-semibold text-gray-700">Institute</span>
                <p className="text-gray-900">{user.institute || "Not specified"}</p>
                </div>
                
                <div>
                <span className="block text-sm font-semibold text-gray-700">Job/Position</span>
                <p className="text-gray-900">{user.job || "Not specified"}</p>
                </div>
                
                <div>
                <span className="block text-sm font-semibold text-gray-700">User ID</span>
                <p className="text-gray-600">{user.id}</p>
                </div>
            </div>
            
            {/* Articles Section */}
            {user.articles && user.articles.length > 0 && (
                <div className="mt-6 border-t pt-6">
                <h3 className="mb-3 font-semibold">My Articles</h3>
                <ul className="space-y-2">
                    {user.articles.map((article) => (
                    <li key={article.id}>
                        <Link
                        href={`/articles/${article.id}`}
                        className="text-blue-600 hover:underline"
                        >
                        {article.title}
                        </Link>
                    </li>
                    ))}
                </ul>
                </div>
            )}
            </div>
        ) : (
            // EDIT MODE
            <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold">Edit Profile Information</h2>
            
            <div className="space-y-4">
                {/* Name */}
                <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                    Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                />
                </div>
                
                {/* Email with Validation */}
                <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email
                </label>
                <div className="mt-1 flex gap-2">
                    <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex-1 rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                    type="button"
                    onClick={checkEmailAvailability}
                    disabled={isCheckingEmail || formData.email === user.email}
                    className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:bg-gray-400"
                    >
                    {isCheckingEmail ? "Checking..." : "Check"}
                    </button>
                </div>
                
                {/* Email Status Messages */}
                {formData.email === user.email && (
                    <p className="mt-1 text-xs text-gray-500">
                    This is your current email
                    </p>
                )}
                
                {emailAvailable === true && formData.email !== user.email && (
                    <p className="mt-1 text-xs text-green-600">
                    ✓ Email is available
                    </p>
                )}
                
                {emailAvailable === false && (
                    <p className="mt-1 text-xs text-red-600">
                    ✗ This email is already taken
                    </p>
                )}
                </div>
                
                {/* Password */}
                <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password *
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password to confirm changes"
                    className="mt-1 w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-red-600">
                    * Password is required to update your profile
                </p>
                </div>
                
                {/* Institute */}
                <div>
                <label htmlFor="institute" className="block text-sm font-semibold text-gray-700">
                    Institute
                </label>
                <input
                    type="text"
                    id="institute"
                    name="institute"
                    value={formData.institute}
                    onChange={handleChange}
                    className="mt-1 w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                />
                </div>
                
                {/* Job */}
                <div>
                <label htmlFor="job" className="block text-sm font-semibold text-gray-700">
                    Job/Position
                </label>
                <input
                    type="text"
                    id="job"
                    name="job"
                    value={formData.job}
                    onChange={handleChange}
                    className="mt-1 w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                />
                </div>
            </div>
            
            {/* Buttons */}
            <div className="mt-6 flex gap-3">
                <button
                type="submit"
                disabled={isLoading}
                className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
                >
                {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="rounded bg-gray-200 px-6 py-2 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100"
                >
                Cancel
                </button>
            </div>
            </form>
        )}
        </div>
    )
}