// app/user/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useUserStore } from "@/app/store/userStore"

interface UserProfile {
  id: number
  name: string
  email: string
  institute?: string
  job?: string
  articles?: { id: number; title: string }[]
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  // Get logged-in user to check if viewing own profile
  const loggedInUser = useUserStore((state) => state.user)
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Check if viewing own profile and data already in Zustand
        if (loggedInUser && loggedInUser.id.toString() === userId) {
          setProfile(loggedInUser)
          setIsLoading(false)
          return
        }
        
        // Fetch other user's profile from API
        const response = await fetch(
          `https://capstone-reference-check.onrender.com/authors/${userId}`
        )
        
        if (!response.ok) {
          throw new Error("User not found")
        }
        
        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user profile")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserProfile()
  }, [userId, loggedInUser])
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Loading user profile...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="rounded border border-red-300 bg-red-50 p-4 text-red-700">
          <h2 className="mb-2 text-lg font-semibold">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }
  
  if (!profile) {
    return (
      <div className="p-8">
        <p>User not found</p>
      </div>
    )
  }
  
  // Check if this is the logged-in user's own profile
  const isOwnProfile = loggedInUser?.id === profile.id
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-6">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
        >
          <span className="mr-2">←</span>
          <span>Back</span>
        </button>
        
        {/* Profile Card */}
        <div className="rounded-lg bg-white shadow-lg">
          
          {/* Header Section */}
          <div className="border-b border-gray-200 px-8 py-6">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.name}
                {isOwnProfile && (
                  <span className="ml-3 text-base font-normal text-gray-500">
                    (Your Profile)
                  </span>
                )}
              </h1>
              
              {/* Edit button only for own profile */}
              {isOwnProfile && (
                <Link
                  href="/user/myprofile"
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Edit Profile
                </Link>
              )}
            </div>
            
            {/* User Info */}
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="mr-2 font-semibold text-gray-700">Email:</span>
                <span className="text-gray-600">{profile.email}</span>
              </div>
              
              {profile.institute && (
                <div className="flex items-start">
                  <span className="mr-2 font-semibold text-gray-700">Institute:</span>
                  <span className="text-gray-600">{profile.institute}</span>
                </div>
              )}
              
              {profile.job && (
                <div className="flex items-start">
                  <span className="mr-2 font-semibold text-gray-700">Position:</span>
                  <span className="text-gray-600">{profile.job}</span>
                </div>
              )}
              
              <div className="flex items-start">
                <span className="text-xs text-gray-400">User ID: {profile.id}</span>
              </div>
            </div>
          </div>
          
          {/* Articles Section */}
          <div className="px-8 py-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {isOwnProfile ? "Your Articles" : "Published Articles"}
            </h2>
            
            {profile.articles && profile.articles.length > 0 ? (
              <div className="space-y-3">
                {profile.articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className="block rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-500 hover:shadow-md"
                  >
                    <h3 className="text-lg font-medium text-blue-600 hover:underline">
                      {article.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Click to read article →
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                {isOwnProfile 
                  ? "You haven't published any articles yet." 
                  : "This user hasn't published any articles yet."
                }
              </p>
            )}
          </div>
          
        </div>
        
        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.back()}
            className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            Back
          </button>
        </div>
        
      </div>
    </div>
  )
}