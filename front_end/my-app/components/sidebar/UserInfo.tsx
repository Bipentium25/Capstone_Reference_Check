interface ArticleSummary {
    id: number
    title: string
}
interface User {
    id: number
    name: string
    email?: string       // optional in case backend returns null
    institute?: string
    job?: string
    articles?: ArticleSummary[]  // optional if sometimes empty or omitted
}

interface UserInfoProps {
    user: User | null
    onLogin: (user: User | null) => void   // no more any
}

export default function UserInfo({ user, onLogin }: UserInfoProps) {
    const handleLogin = async (email: string, password: string) => {
    const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
    })
    if (res.ok) {
      const data: User = await res.json()  // make sure backend returns {id, name, email}
        onLogin(data)
    } else {
        alert("Login failed")
    }
    }

    if (!user) {
    return (
        <form onSubmit={(e) => {
        e.preventDefault()
        handleLogin(e.currentTarget.email.value, e.currentTarget.password.value)
        }}>
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Login</button>
        </form>
    )
    }

    return (
    <div>
        <p>Welcome, {user.name}</p>
        <p>{user.email}</p>
        <button>My Articles</button>
    </div>
    )
}