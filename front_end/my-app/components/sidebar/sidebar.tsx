"use client"

import UserInfo from "./UserInfo"
import SidebarSearch from "./SidebarSearch"
import Link from "next/link"
import styles from "./Sidebar.module.css"

export default function Sidebar() {
    return (
        <aside className={styles.sidebar}>
        {/* Home button */}
        <Link href="/" className={styles.homeBtn}>
            Home
        </Link>
        
        {/* User info */}
        <UserInfo />

        {/* Search - no props needed */}
        <SidebarSearch />
        </aside>
    )
    }