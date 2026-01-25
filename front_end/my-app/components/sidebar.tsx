"use client";
import Link from 'next/link'


type UserLinkButtonProps = {
    userId: string;
};


export default function Sidebar({ userId }: UserLinkButtonProps) {
    return (
    <aside className="w-64 border-r-2 border-black p-4">
        <Link href="/user/login">
            <button>User Login</button>
        </Link>
        
        <div className="w-64 border-r-2 border-black p-4">
        <Link href={`/user/${userId}`}>
            <button>Go to UserInfo</button>
        </Link>
        <div className="ml-2">
            <div>(my articles</div>
            <div>my reference validation)</div>
        </div>
        </div>

        <Link href="/Articles" className="block border-2 border-black rounded px-4 py-2 mb-2 text-center">
        Search article
        </Link>
        
        <button className="w-full text-sm border border-black rounded px-4 py-2 mb-4">
        search
        </button>

        <Link href="/Articles/new" className="block border-2 border-black rounded-full px-4 py-2 text-center">
        New article
        </Link>
    </aside>
    )
}