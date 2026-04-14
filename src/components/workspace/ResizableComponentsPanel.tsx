'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useWorkspaceStore } from '@/lib/store/workspace-store'
import { useQueryGroupsStore } from '@/lib/store/query-groups-store'
import MetricCard from '@/components/tambo/MetricCard'
import GraphCard from '@/components/tambo/GraphCard'
import BusinessSummaryTable from '@/components/tambo/BusinessSummaryTable'
import ComparisonCard from '@/components/tambo/ComparisonCard'
import InsightCard from '@/components/tambo/InsightCard'
import AlertList from '@/components/tambo/AlertList'
import StatusBadge from '@/components/tambo/StatusBadge'
import QueryGroupCard from './QueryGroupCard'

interface ResizableComponentsPanelProps {
  isOpen: boolean
  onToggle: () => void
  defaultHeight?: number
  minHeight?: number
  maxHeight?: number
}

// ── Shared types ───────────────────────────────────────────────────────────────
interface BodyProps {
  viewMode: 'all' | 'query' | 'company'
  components: any[]
  filteredComponents: any[]
  queryGroups: any[]
  activeQueryId: string | null
  uniqueCompanies: string[]
  setActiveQuery: (id: string | null) => void
  toggleQueryGroupCollapsed: (id: string) => void
  removeQueryGroup: (id: string) => void
  removeComponent: (id: string) => void
  getCompanyColor: (company: string) => string
  ComponentGrid: React.ComponentType<{ items: any[] }>
}

export default function ResizableComponentsPanel({
  isOpen,
  onToggle,
  defaultHeight = 420,
  minHeight = 200,
  maxHeight = 700,
}: ResizableComponentsPanelProps) {
  const [panelHeight, setPanelHeight] = useState(defaultHeight)
  const [isResizing, setIsResizing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'all' | 'query' | 'company'>('all')
  const panelRef = useRef<HTMLDivElement>(null)

  const componentsMap = useWorkspaceStore((state) => state.components)
  const componentOrder = useWorkspaceStore((state) => state.componentOrder)
  const removeComponent = useWorkspaceStore((state) => state.removeComponent)
  const clearWorkspace = useWorkspaceStore((state) => state.clearWorkspace)

  const {
    queryGroups,
    activeQueryId,
    toggleQueryGroupCollapsed,
    removeQueryGroup,
    setActiveQuery,
    clearAllQueries,
  } = useQueryGroupsStore()

  const components = componentOrder.map((id) => componentsMap[id]).filter(Boolean)

  const filteredComponents = useMemo(() => {
    if ((viewMode === 'query' || viewMode === 'company') && activeQueryId) {
      const activeGroup = queryGroups.find((g) => g.id === activeQueryId)
      if (activeGroup && (viewMode === 'company' || !activeGroup.collapsed)) {
        return components.filter((c) => activeGroup.componentIds.includes(c.id))
      }
      return []
    }
    return components
  }, [viewMode, activeQueryId, queryGroups, components])

  const uniqueCompanies = useMemo(() => {
    const seen = new Set<string>()
    queryGroups.forEach((g) => seen.add(g.company))
    return Array.from(seen)
  }, [queryGroups])

  // ── Resize ─────────────────────────────────────────────────────────────────
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !isOpen || isFullscreen) return
      const newHeight = window.innerHeight - e.clientY
      if (newHeight >= minHeight && newHeight <= maxHeight) setPanelHeight(newHeight)
    },
    [isResizing, isOpen, isFullscreen, minHeight, maxHeight]
  )

  const handleMouseUp = useCallback(() => setIsResizing(false), [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'row-resize'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getColSpan = (type: string) => {
    switch (type) {
      case 'graph':
      case 'insight':
        return 'sm:col-span-2 lg:col-span-2'
      case 'table':
      case 'alert':
      case 'comparison':
      case 'status':
        return 'sm:col-span-2'
      default:
        return ''
    }
  }

  const getSizeClass = (type: string) => {
    switch (type) {
      case 'metric':      return 'min-h-[160px] max-h-[220px]'
      case 'graph':       return 'min-h-[320px] max-h-[420px]'
      case 'insight':     return 'min-h-[300px] max-h-[400px]'
      case 'comparison':
      case 'status':      return 'min-h-[280px] max-h-[360px]'
      case 'table':
      case 'alert':       return 'min-h-[300px] max-h-[420px]'
      default:            return 'min-h-[250px] max-h-[350px]'
    }
  }

  // FIX: never include `key` in the spread — always pass it directly
  const renderComponent = (component: any) => {
    const { id, type } = component
    const p = component.props  // separate variable, no key inside

    try {
      switch (type) {
        case 'metric':      return <MetricCard      key={id} {...p} />
        case 'graph':       return <GraphCard        key={id} {...p} />
        case 'table':       return <BusinessSummaryTable key={id} {...p} />
        case 'comparison':  return <ComparisonCard   key={id} {...p} />
        case 'insight':     return <InsightCard      key={id} {...p} />
        case 'alert':       return <AlertList        key={id} {...p} />
        case 'status':      return <StatusBadge      key={id} {...p} />
        default:            return null
      }
    } catch (err) {
      console.error('Error rendering', type, err)
      return (
        <div key={id} className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          Error rendering {type}
        </div>
      )
    }
  }

  const getCompanyColor = (company: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-red-100 text-red-800 border-red-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
    ]
    const hash = company.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const ComponentGrid = ({ items }: { items: any[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[minmax(160px,auto)]">
      {items.map((component) => (
        <div key={component.id} className={`relative group ${getColSpan(component.type)}`}>
          <button
            onClick={() => removeComponent(component.id)}
            className="absolute -top-2 -right-2 z-20 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 flex items-center justify-center border-2 border-white"
            title="Remove"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className={`${getSizeClass(component.type)} w-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
            {renderComponent(component)}
          </div>
        </div>
      ))}
    </div>
  )

  const sharedBodyProps: BodyProps = {
    viewMode,
    components,
    filteredComponents,
    queryGroups,
    activeQueryId,
    uniqueCompanies,
    setActiveQuery,
    toggleQueryGroupCollapsed,
    removeQueryGroup,
    removeComponent,
    getCompanyColor,
    ComponentGrid,
  }

  // ── Floating button when panel is closed ───────────────────────────────────
  if (!isOpen) {
    return components.length > 0 ? (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 transition-all hover:scale-105 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
        Show Components ({components.length})
      </button>
    ) : null
  }

  // ── Fullscreen overlay ─────────────────────────────────────────────────────
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900 text-sm">
              Components ({components.length})
            </span>
            <ViewTabs viewMode={viewMode} setViewMode={setViewMode} components={components} queryGroups={queryGroups} uniqueCompanies={uniqueCompanies} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
              Exit Fullscreen
            </button>
            <button
              onClick={() => { setIsFullscreen(false); onToggle() }}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
              title="Close"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => { if (window.confirm('Clear all?')) { clearWorkspace(); clearAllQueries() } }}
              className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              Clear All
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <PanelBody {...sharedBodyProps} />
        </div>
      </div>
    )
  }

  // ── Normal panel ───────────────────────────────────────────────────────────
  const HEADER_H = 52
  return (
    <div
      ref={panelRef}
      className="relative border-t-2 border-indigo-200 bg-white shadow-2xl flex-shrink-0"
      style={{ height: `${panelHeight}px` }}
    >
      {/* Resize handle */}
      <div
        className="absolute top-0 left-0 right-0 h-2 cursor-row-resize flex items-center justify-center hover:bg-indigo-100 transition-colors z-10"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="w-12 h-1 bg-indigo-300 rounded-full" />
      </div>

      {/* Header */}
      <div
        className="px-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between"
        style={{ height: `${HEADER_H}px` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Collapse"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
            Components ({components.length})
          </span>
          <ViewTabs viewMode={viewMode} setViewMode={setViewMode} components={components} queryGroups={queryGroups} uniqueCompanies={uniqueCompanies} />
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fullscreen — hides chat, only shows components"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Clear all components?')) {
                clearWorkspace()
                clearAllQueries()
              }
            }}
            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-lg"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="overflow-y-auto" style={{ height: `${panelHeight - HEADER_H}px` }}>
        <PanelBody {...sharedBodyProps} />
      </div>
    </div>
  )
}

// ── Shared view tabs ───────────────────────────────────────────────────────────
function ViewTabs({
  viewMode, setViewMode, components, queryGroups, uniqueCompanies
}: {
  viewMode: 'all' | 'query' | 'company'
  setViewMode: (m: 'all' | 'query' | 'company') => void
  components: any[]
  queryGroups: any[]
  uniqueCompanies: string[]
}) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5 ml-1">
      {(['all', 'query', 'company'] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {mode === 'all'     && `All (${components.length})`}
          {mode === 'query'   && `Queries (${queryGroups.length})`}
          {mode === 'company' && `Companies (${uniqueCompanies.length})`}
        </button>
      ))}
    </div>
  )
}

// ── Panel body ─────────────────────────────────────────────────────────────────
function PanelBody({
  viewMode, components, filteredComponents, queryGroups, activeQueryId,
  uniqueCompanies, setActiveQuery, toggleQueryGroupCollapsed, removeQueryGroup,
  removeComponent, getCompanyColor, ComponentGrid,
}: BodyProps) {

  if (viewMode === 'all') {
    return (
      <div className="p-4">
        {components.length === 0 ? <EmptyState /> : <ComponentGrid items={components} />}
      </div>
    )
  }

  if (viewMode === 'query') {
    if (queryGroups.length === 0) {
      return (
        <div className="p-4">
          <p className="text-sm text-gray-400 text-center mt-6 mb-4">No query groups yet.</p>
          {components.length > 0 && <ComponentGrid items={components} />}
        </div>
      )
    }
    return (
      <div className="flex h-full">
        <div className="w-72 border-r border-gray-200 overflow-y-auto flex-shrink-0">
          <div className="p-3 space-y-2">
            {queryGroups.map((group) => (
              <QueryGroupCard
                key={group.id}
                group={group}
                isActive={activeQueryId === group.id}
                onToggle={() => toggleQueryGroupCollapsed(group.id)}
                onRemove={() => {
                  group.componentIds.forEach((id: string) => removeComponent(id))
                  removeQueryGroup(group.id)
                }}
                onActivate={() => setActiveQuery(group.id)}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {!activeQueryId ? (
            <p className="text-sm text-gray-400 text-center mt-16">Select a query to view components</p>
          ) : filteredComponents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-16">No components in this group (collapsed?)</p>
          ) : (
            <ComponentGrid items={filteredComponents} />
          )}
        </div>
      </div>
    )
  }

  if (viewMode === 'company') {
    return (
      <div className="p-4">
        {uniqueCompanies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveQuery(null)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                !activeQueryId ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({components.length})
            </button>
            {uniqueCompanies.map((company) => {
              const group = queryGroups.find((g: any) => g.company === company)
              const count = group
                ? components.filter((c: any) => group.componentIds.includes(c.id)).length
                : 0
              return (
                <button
                  key={company}
                  onClick={() => group && setActiveQuery(group.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    activeQueryId === group?.id
                      ? getCompanyColor(company)
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'
                  }`}
                >
                  {company} ({count})
                </button>
              )
            })}
          </div>
        )}
        <ComponentGrid items={filteredComponents.length ? filteredComponents : components} />
      </div>
    )
  }

  return null
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
      </svg>
      <p className="text-sm font-medium">No components yet</p>
      <p className="text-xs mt-1">Ask a question to generate analytics</p>
    </div>
  )
}