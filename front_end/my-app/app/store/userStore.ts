// app/store/userStore.ts
"use client"

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
    setUser: (user: User | null) => void
    logout: () => void
    }

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
        user: null,
        setUser: (user) => set({ user }),
        logout: () => {
            set({ user: null })
            localStorage.removeItem('user-storage') // Clean up localStorage
        },
        }),
        {
        name: 'user-storage', // localStorage key
        }
    )
)