'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useGemini } from '@/lib/hooks/useGemini'
import { useChatHistoryStore, type ChatMessage } from '@/lib/store/chat-history-store'
import { useWorkspaceStore } from '@/lib/store/workspace-store'
import { useQueryGroupsStore } from '@/lib/store/query-groups-store'
import { useAuthStore } from '@/lib/store/auth-store'
import ResizableComponentsPanel from '@/components/workspace/ResizableComponentsPanel'

export default function GeminiChatInterface() {
  const user = useAuthStore((state) => state.user)
  const { analyze, loading: analyzing, error: analysisError } = useGemini()

  const currentSession = useChatHistoryStore((state) => state.getCurrentSession())
  const addMessage = useChatHistoryStore((state) => state.addMessage)
  const createSession = useChatHistoryStore((state) => state.createSession)
  const setCurrentSession = useChatHistoryStore((state) => state.setCurrentSession)

  const addComponent = useWorkspaceStore((state) => state.addComponent)
  const componentsMap = useWorkspaceStore((state) => state.components)
  const componentOrder = useWorkspaceStore((state) => state.componentOrder)
  const { addQueryGroup } = useQueryGroupsStore()

  const components = componentOrder.map((id) => componentsMap[id]).filter(Boolean)

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!currentSession && user) {
      const id = createSession(user.id, 'New Analysis')
      setCurrentSession(id)
    }
  }, [user, currentSession, createSession, setCurrentSession])

  useEffect(() => {
    if (currentSession) setMessages(currentSession.messages)
  }, [currentSession?.id])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const extractCompany = (query: string): string => {
    const known = [
      'ibm', 'apple', 'google', 'microsoft', 'amazon', 'tesla', 'nike',
      'meta', 'samsung', 'intel', 'oracle', 'salesforce', 'facebook',
      'adidas', 'walmart', 'coca-cola', 'pepsi', 'netflix', 'disney', 'sony', 'amd',
    ]
    const q = query.toLowerCase()
    for (const c of known) if (q.includes(c)) return c.toUpperCase()
    const cap = query.match(/\b([A-Z][a-z]{2,})\b/)
    return cap ? cap[1] : 'General'
  }

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!message.trim() || analyzing || !currentSession) return

    setError(null)
    const userQuery = message

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userQuery,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    addMessage(currentSession.id, userMsg)
    setMessage('')

    try {
      const uploadedDataStr = uploadedFiles.map((f) => f.name).join(', ')
      const analysisResult = await analyze(userQuery, uploadedDataStr)

      const componentIds: string[] = []
      if (analysisResult.components?.length > 0) {
        analysisResult.components.forEach((comp) => {
          const id = addComponent(comp.type as any, comp.data)
          if (id) componentIds.push(id)
        })
        addQueryGroup(userQuery, extractCompany(userQuery), componentIds)
        setIsPanelOpen(true)
      }

      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: analysisResult.summary,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])
      addMessage(currentSession.id, assistantMsg)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return
    setIsUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        await new Promise((r) => setTimeout(r, 300))
        setUploadedFiles((prev) => [...prev, files[i]])
      }
    } catch {
      setError('Failed to upload file.')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Buildify Labs</h2>
              <p className="text-gray-500 text-sm mb-6">
                Ask about any company to generate interactive analytics
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {[
                  'Show revenue metrics for IBM',
                  'Compare Apple vs Microsoft',
                  'IBM table last 3 years',
                  'Show growth trend for Tesla',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setMessage(q)}
                    className="px-4 py-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-indigo-400 hover:shadow-sm transition-all text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              // id="msg-{id}" allows PastChatsSidebar to scrollIntoView
              <div
                key={msg.id}
                id={`msg-${msg.id}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} transition-all rounded-2xl`}
              >
                <div
                  className={`max-w-xl px-4 py-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}

          {analyzing && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  <span className="text-xs text-gray-400 ml-1">Analyzing…</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error */}
      {(error || analysisError) && (
        <div className="px-6 py-2 bg-red-50 border-t border-red-200 text-red-600 text-sm flex-shrink-0 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error || analysisError}
        </div>
      )}

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="px-6 py-2 bg-blue-50 border-t border-blue-100 flex-shrink-0 flex flex-wrap gap-2">
          {uploadedFiles.map((file, idx) => (
            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
              {file.name}
              <button onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
                className="ml-1.5 text-blue-400 hover:text-blue-700">×</button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || analyzing}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
              title="Attach file"
            >
              📎
            </button>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={analyzing}
              placeholder="Ask about any company… (Enter to send)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none text-sm"
              rows={2}
            />
            <button
              onClick={() => handleSend()}
              disabled={!message.trim() || analyzing}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-sm flex-shrink-0"
            >
              {analyzing ? '…' : 'Send'}
            </button>
          </div>
          <input ref={fileInputRef} type="file" multiple
            accept=".csv,.pdf,.xlsx,.xls,.txt,.json" onChange={handleFileSelect} className="hidden" />
          <p className="text-xs text-gray-400 mt-2">
            💡 Enter to send · Shift+Enter for new line
            {components.length > 0 && !isPanelOpen && (
              <button
                onClick={() => setIsPanelOpen(true)}
                className="ml-3 text-indigo-500 hover:text-indigo-700 font-medium"
              >
                ↑ Show {components.length} component{components.length !== 1 ? 's' : ''}
              </button>
            )}
          </p>
        </div>
      </div>

      {/* Components panel */}
      <ResizableComponentsPanel
        isOpen={isPanelOpen && components.length > 0}
        onToggle={() => setIsPanelOpen(!isPanelOpen)}
        defaultHeight={420}
        minHeight={200}
        maxHeight={700}
      />
    </div>
  )
}