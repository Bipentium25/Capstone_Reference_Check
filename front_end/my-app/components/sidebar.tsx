import Link from 'next/link'

export default function Sidebar() {
    return (
    <aside className="w-64 border-r-2 border-black p-4">
        <button className="w-full border-2 border-black rounded px-4 py-2 mb-4">
        User log in
        </button>
        
        <div className="mb-4 text-sm">
        <Link href="/User">user info</Link>
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