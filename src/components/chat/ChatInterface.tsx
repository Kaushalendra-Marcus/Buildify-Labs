'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTamboThread, useTamboThreadInput } from '@tambo-ai/react'
import { useTamboWorkspaceIntegration } from '@/lib/hooks/useTamboWorkspaceIntegration'
import { useWorkspaceStore } from '@/lib/store/workspace-store'
import ResizableComponentsPanel from '@/components/workspace/ResizableComponentsPanel'

export default function ChatInterface() {
  const { thread, sendThreadMessage } = useTamboThread()
  const { value, setValue, submit, isPending } = useTamboThreadInput()

  // Integration hook to process Tambo responses
  useTamboWorkspaceIntegration()

  // Get components from workspace store
  const componentsMap = useWorkspaceStore(state => state.components)
  const componentOrder = useWorkspaceStore(state => state.componentOrder)
  const clearWorkspace = useWorkspaceStore(state => state.clearWorkspace)

  const components = componentOrder
    .map(id => componentsMap[id])
    .filter(Boolean)

  // Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [thread?.messages, components, scrollToBottom])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!value.trim() || isPending) return

    setError(null)

    try {
      await submit()
      // Auto-open panel when components are generated
      if (!isPanelOpen) {
        setIsPanelOpen(true)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message. Please try again.')
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        await new Promise(resolve => setTimeout(resolve, 500))
        setUploadedFiles(prev => [...prev, file])
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  // Fixed: Clean message content by removing JSON - KEEP USER MESSAGES VISIBLE
  const getCleanMessageContent = (content: any, role: string): string => {
    let rawText = ''
    
    if (typeof content === 'string') {
      rawText = content
    } else if (Array.isArray(content)) {
      rawText = content
        .filter(item => item?.type === 'text')
        .map(item => item.text)
        .join('\n')
    } else if (content?.type === 'text') {
      rawText = content.text
    }
    
    if (!rawText) {
      if (role === 'user') {
        return '[Message sent]'
      }
      return ''
    }
    
    if (role === 'assistant') {
      const cleaned = rawText.replace(/\{"type":"tool".*?\}\}/g, '').trim()
      
      if (cleaned.length === 0 && rawText.includes('show_component_')) {
        return '✨ Generated interactive components'
      }
      
      return cleaned
    }
    
    return rawText.trim()
  }

  // Generate unique message keys
  const getMessageKey = (message: any, index: number) => {
    const timestamp = new Date(message.createdAt).getTime()
    const random = Math.random().toString(36).substr(2, 9)
    return `msg_${index}_${timestamp}_${random}`
  }

  const quickPrompts = [
    "Show revenue metrics for Nike",
    "Analyze growth for Y Combinator startups",
    "Compare Amazon vs Microsoft",
    "Generate business summary for Tesla",
    "Show alerts for Walmart",
    "Create dashboard for Campus X"
  ]

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      {/* Main Chat Area */}
      <div className={`flex-1 min-h-0 overflow-y-auto scrollbar-thin ${isPanelOpen ? '' : 'pb-4'}`}>
        <div className="max-w-4xl mx-auto p-6">
          {/* Welcome message */}
          {(!thread?.messages || thread.messages.length === 0) && components.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-block p-4 bg-blue-50 rounded-2xl mb-6">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Buildify Labs - AI Business Intelligence</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Ask about any company to generate interactive analytics components</p>
              
              {/* Panel Toggle Button */}
              {components.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isPanelOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      )}
                    </svg>
                    {isPanelOpen ? 'Hide Components' : 'Show Components'}
                  </button>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-xl mx-auto">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setValue(prompt)}
                    className="px-4 py-3 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all hover:border-gray-300 hover:shadow-sm text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-6">
            {thread?.messages?.map((message, index) => {
              const cleanContent = getCleanMessageContent(message.content, message.role)
              if (message.role === 'user' || (cleanContent && cleanContent.trim().length > 0)) {
                return (
                  <div
                    key={getMessageKey(message, index)}
                    id={`message-${message.id}`}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                      }`}
                    >
                      {/* User message indicator */}
                      {message.role === 'user' && (
                        <div className="flex items-center mb-2 text-xs font-medium text-blue-100">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-300 to-blue-400 rounded-full flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          You
                        </div>
                      )}
                      
                      {/* Assistant message indicator */}
                      {message.role === 'assistant' && (
                        <div className="flex items-center mb-2 text-xs font-medium text-gray-600">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          AI Assistant
                        </div>
                      )}
                      
                      <div className="whitespace-pre-wrap break-words">{cleanContent}</div>
                      
                      {/* Timestamp */}
                      <div className={`text-xs mt-3 pt-2 border-t ${message.role === 'user' ? 'border-blue-500/30 text-blue-100/80' : 'border-gray-100 text-gray-400'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      {message.role === 'assistant' && (() => {
                        const content: any = message.content
                        let hasComponents = false
                        
                        if (typeof content === 'string') {
                          hasComponents = (content as string).includes('show_component_')
                        } else if (content) {
                          try {
                            hasComponents = JSON.stringify(content).includes('show_component_')
                          } catch {
                            hasComponents = false
                          }
                        }
                        
                        return hasComponents ? (
                          <div className="mt-3 pt-3 border-t border-gray-100 border-opacity-30 flex items-center text-xs text-gray-400">
                            <svg className="w-3.5 h-3.5 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Components generated
                          </div>
                        ) : null
                      })()}
                    </div>
                  </div>
                )
              }
              
              return null
            })}

            {/* Loading indicator */}
            {isPending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm w-64">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {/* AI icon with pulse effect */}
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        {/* Pulsing ring */}
                        <div className="absolute inset-0 rounded-lg border-2 border-blue-400 animate-ping opacity-20"></div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <div className="text-xs font-medium text-gray-600">AI is thinking</div>
                      </div>
                      
                      {/* Animated typing dots */}
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex justify-center">
                <div className="max-w-[80%] p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Resizable Components Panel */}
      <ResizableComponentsPanel
        isOpen={isPanelOpen && components.length > 0}
        onToggle={() => setIsPanelOpen(!isPanelOpen)}
        defaultHeight={400}
        minHeight={200}
        maxHeight={800}
      />

      {/* Fixed Input Area */}
      <div className="border-t border-gray-200 bg-white py-4 px-6 flex-shrink-0 relative z-20">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="relative">
            <div className="relative bg-white border border-gray-300 rounded-2xl hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask about any company (e.g., 'Show revenue for Nike', 'Compare Apple vs Microsoft')..."
                className="w-full bg-transparent px-12 py-3 text-sm resize-none focus:outline-none max-h-32 rounded-2xl"
                rows={1}
                disabled={isPending || isUploading}
                style={{ 
                  minHeight: '24px',
                  maxHeight: '128px'
                }}
              />
              
              {/* Panel Toggle Button (when components exist) */}
              {components.length > 0 && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title={isPanelOpen ? "Hide components" : "Show components"}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isPanelOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      )}
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* File Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending || isUploading}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Attach file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!value.trim() || isPending || isUploading}
                  className={`p-2 text-white rounded-xl transition-all flex items-center justify-center ${
                    isPending 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isPending ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.pdf,.xlsx,.xls,image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </form>

          {/* File Uploads Indicator */}
          {uploadedFiles.length > 0 && (
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} attached
            </div>
          )}
        </div>
      </div>
    </div>
  )
}