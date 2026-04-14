'use client'

import { useState, useMemo } from 'react'
import { useChatHistoryStore } from '@/lib/store/chat-history-store'
import { useAuthStore } from '@/lib/store/auth-store'

interface PastChatsSidebarProps {
  onClose?: () => void
}

export default function PastChatsSidebar({ onClose }: PastChatsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const user = useAuthStore((state) => state.user)
  const allSessions = useChatHistoryStore((state) => state.sessions)
  const currentSessionId = useChatHistoryStore((state) => state.currentSessionId)
  const setCurrentSession = useChatHistoryStore((state) => state.setCurrentSession)

  // Get current session messages
  const currentSession = currentSessionId ? allSessions[currentSessionId] : null
  const messages = currentSession?.messages ?? []

  // Format relative time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  // Build display list from current session messages
  const displayMessages = useMemo(() => {
    return messages
      .map((msg) => ({
        id: msg.id,
        role: msg.role,
        preview: msg.content.length > 70 ? msg.content.slice(0, 70) + '…' : msg.content,
        time: formatTime(msg.timestamp),
      }))
      .filter((m) =>
        !searchQuery ||
        m.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [messages, searchQuery])

  // Scroll to a message in the chat area
  const scrollToMessage = (id: string) => {
    const el = document.getElementById(`msg-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-indigo-400', 'ring-offset-1')
      setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-400', 'ring-offset-1'), 2000)
    }
  }

  // Past sessions for switching
  const pastSessions = useMemo(() => {
    if (!user?.id) return []
    return Object.values(allSessions)
      .filter((s) => s.userId === user.id)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
  }, [allSessions, user?.id])

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Hide sidebar"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <span className="text-sm font-semibold text-gray-900">Current Chat</span>
          </div>
          <span className="text-xs text-gray-400">{messages.length} messages</span>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
          <svg className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Current session messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {displayMessages.length === 0 ? (
          <div className="text-center py-10 px-4">
            <svg className="w-10 h-10 mx-auto text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm text-gray-400">No messages yet</p>
            <p className="text-xs text-gray-300 mt-1">Start chatting to see them here</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {displayMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => scrollToMessage(msg.id)}
                className={`w-full text-left p-3 rounded-lg transition-all hover:bg-gray-50 border-l-2 ${
                  msg.role === 'user' ? 'border-indigo-400' : 'border-green-400'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${msg.role === 'user' ? 'bg-indigo-400' : 'bg-green-400'}`} />
                  <span className="text-xs font-medium text-gray-600">
                    {msg.role === 'user' ? 'You' : 'AI'}
                  </span>
                  <span className="text-xs text-gray-300 ml-auto">{msg.time}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{msg.preview}</p>
              </button>
            ))}
          </div>
        )}

        {/* Past sessions */}
        {pastSessions.length > 1 && (
          <div className="px-3 pb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Past Sessions</p>
            <div className="space-y-1">
              {pastSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setCurrentSession(session.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                    session.id === currentSessionId
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium truncate">{session.title}</div>
                  <div className="text-gray-400 mt-0.5">
                    {session.messages.length} messages · {formatTime(session.updatedAt)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> You
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" /> AI
            </span>
          </div>
          <span>{displayMessages.length} of {messages.length} shown</span>
        </div>
      </div>
    </div>
  )
}