'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  firstName: string
  isDemo: boolean
  isAdmin: boolean
  createdAt: string
}

interface UseUserReturn {
  user: User | null
  isDemo: boolean
  isLoading: boolean
  isAuthenticated: boolean
  refresh: () => Promise<void>
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = (await response.json()) as { user: User }
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return {
    user,
    isDemo: user?.isDemo ?? true,
    isLoading,
    isAuthenticated: user !== null,
    refresh: fetchUser,
  }
}
