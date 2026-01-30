"use client"

import { useState } from "react"
import UserInfo from "./UserInfo"
import SidebarSearch from "./SidebarSearch"
import Link from "next/link"
import styles from "./Sidebar.module.css"

    export default function Sidebar() {
    const [user, setUser] = useState<null | {
        id: number
        name: string
        email: string
    }>(null)

    async function handleSearch(type: string, query: string) {
        // Optionally navigate to results page
    }

    return (
        <aside className={styles.sidebar}>
        
       {/* Home button */}
        <Link href="/" className={styles.homeBtn}>
        Home
        </Link>
        {/* User info */}
        <UserInfo user={user} onLogin={setUser} />

        {/* Search */}
        <SidebarSearch onSearch={handleSearch} />
        </aside>
    )
    }