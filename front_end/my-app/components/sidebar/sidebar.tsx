"use client"

import { useState } from "react"
import UserInfo from "./UserInfo"
import SidebarSearch from "./SidebarSearch"

export default function Sidebar() {
    const [user, setUser] = useState<null | {
    id: number
    name: string
    email: string
    }>(null)


    async function handleSearch(type: string, query: string) {
    // Option A: navigate to results page
    // router.push(`/search?type=${type}&q=${encodeURIComponent(query)}`)
    }

    return (
    <aside>
        <UserInfo user={user} onLogin={setUser} />

        <SidebarSearch onSearch={handleSearch} />
    </aside>
    )
}