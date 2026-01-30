"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useUserStore } from "@/app/store/userStore"
import styles from "./User_id.module.css"

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
      <div className={styles.pageWrapper + " flex items-center justify-center"}>
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
  
  const isOwnProfile = loggedInUser?.id === profile.id
  
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className={styles.backButton}
        >
          <span>←</span>
          <span>Back</span>
        </button>
        
        {/* Profile Card */}
        <div className={styles.profileCard}>
          
          {/* Header Section */}
          <div className={styles.profileHeader}>
            <div className={styles.profileHeaderTop}>
              <h1 className={styles.profileName}>
                {profile.name}
                {isOwnProfile && (
                  <span className={styles.profileSubtext}>
                    (Profile)
                  </span>
                )}
              </h1>
              
              {isOwnProfile && (
                <Link
                  href="/user/myprofile"
                  className={styles.editButton}
                >
                  Edit Profile
                </Link>
              )}
            </div>
            
            {/* User Info */}
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{profile.email}</span>
              </div>
              
              {profile.institute && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Institute:</span>
                  <span className={styles.value}>{profile.institute}</span>
                </div>
              )}
              
              {profile.job && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Position:</span>
                  <span className={styles.value}>{profile.job}</span>
                </div>
              )}
              
              <div className={styles.infoRow}>
                <span className="text-xs text-gray-400">User ID: {profile.id}</span>
              </div>
            </div>
          </div>
          
          {/* Articles Section */}
          <div className={styles.articlesSection}>
            <h2 className={styles.articlesTitle}>
              {isOwnProfile ? "Articles" : "Published Articles"}
            </h2>
            
            {profile.articles && profile.articles.length > 0 ? (
              <div>
                {profile.articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className={styles.articleCard}
                  >
                    <h3 className={styles.articleTitle}>
                      {article.title}
                    </h3>
                    <p className={styles.articleSubtitle}>
                      Click to read article →
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className={styles.articleSubtitle}>
                {isOwnProfile 
                  ? "You haven't published any articles yet." 
                  : "This user hasn't published any articles yet."}
              </p>
            )}
          </div>
          
        </div>
        
        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={() => router.back()}
            className={`${styles.actionButton} ${styles.backAction}`}
          >
            Back
          </button>
        </div>
        
      </div>
    </div>
  )
}