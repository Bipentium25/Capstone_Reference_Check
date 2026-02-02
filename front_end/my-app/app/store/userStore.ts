// app/store/userStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: number
    name: string
    email: string
    institute?: string
    job?: string
    articles?: { id: number; title: string }[]
    }

    interface UserStore {
    user: User | null
    setUser: (user: User) => void
    logout: () => void
    refreshUser: () => Promise<void>  // ← ADD THIS
    }

    export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
        user: null,
        setUser: (user) => set({ user }),
        logout: () => {
            set({ user: null })
            localStorage.removeItem('user-storage')
        },
        // ✨ NEW: Refresh user data from API
        refreshUser: async () => {
            const currentUser = get().user
            if (!currentUser) return
            
            try {
            const response = await fetch(
                `https://capstone-reference-check.onrender.com/authors/${currentUser.id}`
            )
            if (response.ok) {
                const updatedUser = await response.json()
                set({ user: updatedUser })
            }
            } catch (err) {
            console.error("Failed to refresh user:", err)
            }
        }
        }),
        {
        name: 'user-storage',
        }
    )
)