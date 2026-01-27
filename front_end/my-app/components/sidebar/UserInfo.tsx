"use client"

type User = {
    id: number
    name: string
    email: string
}

type Props = {
    user: User | null
    onLogin: (user: User) => void
}

export default function UserInfo({ user, onLogin }: Props) {
    if (!user) {
    return (
        <div>
        <h3>Login</h3>
        <button
            onClick={() =>
            onLogin({
                id: 1,
                name: "Alice Zhang",
                email: "alice.zhang@example.com",
            })
            }
        >
            Log in
        </button>
        </div>
    )
    }

    return (
    <div>
        <p>{user.name}</p>
        <p>{user.email}</p>
        <button>My Articles</button>
    </div>
    )
}