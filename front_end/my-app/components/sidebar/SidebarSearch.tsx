"use client";

import { useState } from "react";

type SearchType = "author" | "title" | "article_id";

type Props = {
    onSearch: (type: SearchType, query: string) => void;
};

export default function SidebarSearch({ onSearch }: Props) {
    const [type, setType] = useState<SearchType>("title");
    const [query, setQuery] = useState("");

    return (
        <div className="space-y-2">
            <select
                value={type}
                onChange={(e) => setType(e.target.value as SearchType)}
                className="w-full border p-1"
            >
                <option value="author">Author</option>
                <option value="title">Article Title</option>
                <option value="article_id">Article ID</option>
            </select>

            <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border p-1"
            />

            <button
                className="w-full rounded bg-black py-1 text-white disabled:bg-gray-400"
                onClick={() => onSearch(type, query)}
                disabled={!query.trim()}
            >
                Search
            </button>
        </div>
    );
}