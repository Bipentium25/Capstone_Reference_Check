'use client'
import { useSearchParams } from 'next/navigation'

export default function HomePage() {
  const searchParams = useSearchParams()
  const newUser = searchParams.get('newUser')

  return (
    <div>
      {newUser === 'true' && (
        <div className="p-4 mb-4 rounded bg-green-100 text-green-800">
          Your account has been created! Please log in.
        </div>
      )}
      <h1>Bienvenue</h1>
    </div>
  )}