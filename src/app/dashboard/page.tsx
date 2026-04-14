'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store/auth-store'
import { useChatHistoryStore } from '@/lib/store/chat-history-store'
import { useWorkspaceStore } from '@/lib/store/workspace-store'

export default function Dashboard() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  // ✅ Select only stable primitives from the store (plain object reference, not a derived call)
  // Zustand uses Object.is() to compare — methods that return new arrays every call cause
  // "getSnapshot should be cached" warning and infinite re-render loops.
  const allSessions = useChatHistoryStore((state) => state.sessions)
  const togglePin = useChatHistoryStore((state) => state.togglePin)
  const deleteSession = useChatHistoryStore((state) => state.deleteSession)
  const components = useWorkspaceStore((state) => state.components)

  // ✅ Derive filtered/sorted data with useMemo — runs only when allSessions or user.id changes
  const sessions = useMemo(() => {
    if (!user?.id) return []
    return Object.values(allSessions)
      .filter((s) => s.userId === user.id)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  }, [allSessions, user?.id])

  const pinnedSessions = useMemo(() => {
    if (!user?.id) return []
    return Object.values(allSessions)
      .filter((s) => s.userId === user.id && s.pinned)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [allSessions, user?.id])

  useEffect(() => {
    setMounted(true)
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const componentCount = Object.keys(components).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">BL</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Buildify Labs</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              New Analysis
            </Link>
            <button
              onClick={() => {
                logout()
                router.push('/signin')
              }}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Card */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-600">
          <div className="flex items-center space-x-4">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium">Total Analyses</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{sessions.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Generated Components</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{componentCount}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-purple-500">
            <p className="text-gray-600 text-sm font-medium">Pinned Sessions</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{pinnedSessions.length}</p>
          </div>
        </div>

        {/* Pinned Sessions */}
        {pinnedSessions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pinned Analyses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pinnedSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/?session=${session.id}`}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border-l-4 border-yellow-400"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 line-clamp-2">{session.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {session.description || `${session.messages.length} messages`}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        togglePin(session.id)
                      }}
                      className="text-lg"
                    >
                      ⭐
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Analyses</h3>
          {sessions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-600 mb-4">No analyses yet. Start by creating a new analysis!</p>
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create New Analysis
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/?session=${session.id}`}
                  className="block bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{session.title}</h4>
                      <div className="flex items-center space-x-4 mt-2">
                        <p className="text-sm text-gray-600">{session.messages.length} messages</p>
                        <p className="text-sm text-gray-600">{session.components.length} components</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          togglePin(session.id)
                        }}
                        className="text-lg text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        {session.pinned ? '⭐' : '☆'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          if (confirm('Delete this analysis?')) {
                            deleteSession(session.id)
                          }
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(session.updatedAt).toLocaleDateString()} –{' '}
                    {new Date(session.updatedAt).toLocaleTimeString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}