'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: number
}

interface AuthStore {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || 'Login failed')
          }

          const data = await response.json()
          set({ user: data.user, isAuthenticated: true, error: null })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ error: message, isAuthenticated: false })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      signup: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || 'Signup failed')
          }

          const data = await response.json()
          set({ user: data.user, isAuthenticated: true, error: null })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Signup failed'
          set({ error: message, isAuthenticated: false })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        fetch('/api/auth/logout', { method: 'POST' }).catch(console.error)
        set({ user: null, isAuthenticated: false, error: null })
      },

      checkAuth: async () => {
        try {
          const response = await fetch('/api/auth/session')
          if (response.ok) {
            const data = await response.json()
            set({ user: data.user, isAuthenticated: true })
          } else {
            set({ user: null, isAuthenticated: false })
          }
        } catch {
          set({ user: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
