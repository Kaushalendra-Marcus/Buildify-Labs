"use client"

import { Suspense, useEffect, useState, useRef, useCallback } from "react"
import Image from "next/image"

import ChatInterface from "@/components/chat/ChatInterface"
import PastChatsSidebar from "@/components/chat/PastChatsSidebar"
import { useWorkspaceStore } from "@/lib/store/workspace-store"
import { ErrorBoundary } from "@/components/ErrorBoundary"

// Define ChatLoadingSkeleton separately
function ChatLoadingSkeleton() {
  return (
    <div className="h-full p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div
              className={`h-16 ${
                i % 2 === 0 ? "bg-gray-200" : "bg-gray-100"
              } rounded-lg`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(320) // Initial width in pixels
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const activeComponentCount = useWorkspaceStore(
    state => state.activeComponentCount
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle mouse down on resizer
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  // Handle mouse move for resizing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !sidebarOpen) return
    
    const newWidth = e.clientX
    // Set min and max width constraints
    if (newWidth > 200 && newWidth < 600) {
      setSidebarWidth(newWidth)
    }
  }, [isResizing, sidebarOpen])

  // Handle mouse up to stop resizing
  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  // Add event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  // Disable text selection during resize
  useEffect(() => {
    if (isResizing) {
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'
    } else {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isResizing])

  return (
    <div className="h-full flex bg-white">
      {/* Left Sidebar with Resizer */}
      {sidebarOpen && (
        <div className="relative flex-shrink-0">
          {/* Sidebar */}
          <div 
            ref={sidebarRef}
            className="h-full border-r border-gray-200 bg-white"
            style={{ width: `${sidebarWidth}px` }}
          >
            <ErrorBoundary>
              <PastChatsSidebar onClose={() => setSidebarOpen(false)} />
            </ErrorBoundary>
          </div>
          
          {/* Resizer Handle */}
          <div
            className="absolute top-0 right-0 bottom-0 w-1 hover:w-2 bg-transparent hover:bg-blue-300 active:bg-blue-500 cursor-col-resize transition-all duration-150 z-20"
            onMouseDown={handleMouseDown}
            style={{
              transform: 'translateX(50%)',
              right: '-1px' // Half of the width
            }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Show sidebar"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                </button>
              )}

              {/* Logo + Title */}
              <div className="flex items-center gap-3">
                <Image
                  src="/logo1.ico"
                  alt="Logo"
                  width={40}
                  height={40}
                  priority
                  className="rounded-full"
                />

                <h1 className="text-lg font-semibold text-gray-900">
                  Buildify Labs - AI Business Intelligence
                </h1>
              </div>

              {mounted && activeComponentCount > 0 && (
                <div className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {activeComponentCount} component
                  {activeComponentCount !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => {
                  if (window.confirm('Start a new chat? This will clear the current conversation.')) {
                    window.location.reload()
                  }
                }}
              >
                New Chat
              </button>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 min-h-0">
          <ErrorBoundary>
            <Suspense fallback={<ChatLoadingSkeleton />}>
              <ChatInterface />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}