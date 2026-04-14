'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  userId: string
  title: string
  description?: string
  messages: ChatMessage[]
  components: Array<{
    id: string
    type: string
    title: string
  }>
  createdAt: string
  updatedAt: string
  pinned: boolean
}

interface ChatHistoryStore {
  // State
  sessions: Record<string, ChatSession>
  currentSessionId: string | null

  // Actions
  createSession: (userId: string, title: string) => string
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void
  addMessage: (sessionId: string, message: ChatMessage) => void
  deleteSession: (sessionId: string) => void
  setCurrentSession: (sessionId: string) => void
  togglePin: (sessionId: string) => void
  clearAllSessions: () => void

  // Getters (safe for imperative use via get(); do NOT use these as Zustand selectors
  // because they return new arrays every call — use useMemo in components instead)
  getCurrentSession: () => ChatSession | null
  getSessionsByUser: (userId: string) => ChatSession[]
  getRecentSessions: (userId: string, limit?: number) => ChatSession[]
  getPinnedSessions: (userId: string) => ChatSession[]
}

export const useChatHistoryStore = create<ChatHistoryStore>()(
  persist(
    (set, get) => ({
      sessions: {},
      currentSessionId: null,

      createSession: (userId: string, title: string) => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              id: sessionId,
              userId,
              title,
              description: '',
              messages: [],
              components: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              pinned: false,
            },
          },
          currentSessionId: sessionId,
        }))
        return sessionId
      },

      updateSession: (sessionId: string, updates: Partial<ChatSession>) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...state.sessions[sessionId],
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          },
        }))
      },

      addMessage: (sessionId: string, message: ChatMessage) => {
        set((state) => {
          const session = state.sessions[sessionId]
          if (!session) return state
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: [...session.messages, message],
                updatedAt: new Date().toISOString(),
              },
            },
          }
        })
      },

      deleteSession: (sessionId: string) => {
        set((state) => {
          const { [sessionId]: _, ...remainingSessions } = state.sessions
          return {
            sessions: remainingSessions,
            currentSessionId:
              state.currentSessionId === sessionId ? null : state.currentSessionId,
          }
        })
      },

      setCurrentSession: (sessionId: string) => {
        set({ currentSessionId: sessionId })
      },

      togglePin: (sessionId: string) => {
        set((state) => {
          const session = state.sessions[sessionId]
          if (!session) return state
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                pinned: !session.pinned,
              },
            },
          }
        })
      },

      clearAllSessions: () => {
        set({ sessions: {}, currentSessionId: null })
      },

      // ─── Getters ────────────────────────────────────────────────────────────
      // These are safe for IMPERATIVE calls: store.getState().getRecentSessions(id)
      // Do NOT pass them as selectors to useChatHistoryStore() in React components —
      // they return new array instances every call, which breaks Zustand's equality check.
      // Use useMemo with (state) => state.sessions instead (see dashboard/page.tsx).

      getCurrentSession: () => {
        const { sessions, currentSessionId } = get()
        if (!currentSessionId) return null
        return sessions[currentSessionId] ?? null
      },

      getSessionsByUser: (userId: string) => {
        return Object.values(get().sessions).filter((s) => s.userId === userId)
      },

      getRecentSessions: (userId: string, limit = 10) => {
        return Object.values(get().sessions)
          .filter((s) => s.userId === userId)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit)
      },

      getPinnedSessions: (userId: string) => {
        return Object.values(get().sessions)
          .filter((s) => s.userId === userId && s.pinned)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      },
    }),
    {
      name: 'chat-history-store',
    }
  )
)