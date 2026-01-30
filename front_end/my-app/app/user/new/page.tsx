'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import styles from './NewUserPage.module.css'

export default function NewUserPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    institute: '',
    job: '',
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch(
        'https://capstone-reference-check.onrender.com/authors',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || 'Failed to create user')
      }

      router.push('/')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'An error occurred')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create New User</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {['name', 'email', 'password', 'institute', 'job'].map((field) => (
            <div key={field} className={styles.field}>
              <label htmlFor={field} className={styles.label}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field === 'password' ? 'password' : 'text'}
                name={field}
                id={field}
                value={(formData as any)[field]}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Submitting...' : 'Create Account'}
          </button>

          {status === 'error' && message && (
            <p className={styles.error}>{message}</p>
          )}
        </form>
      </div>
    </div>
  )
}