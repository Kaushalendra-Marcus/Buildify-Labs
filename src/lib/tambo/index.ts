// This file should only be imported in client components
import { z } from 'zod'
import type { TamboComponent } from '@tambo-ai/react'

import MetricCard from '@/components/tambo/MetricCard'
import StatusBadge from '@/components/tambo/StatusBadge'
import GraphCard from '@/components/tambo/GraphCard'
import BusinessSummaryTable from '@/components/tambo/BusinessSummaryTable'
import InsightCard from '@/components/tambo/InsightCard'
import ComparisonCard from '@/components/tambo/ComparisonCard'
import AlertList from '@/components/tambo/AlertList'

// ─── Normalizer helpers ───────────────────────────────────────────────────────
// Zod v4: use z.preprocess() instead of .transform().pipe() chains

function normalizeTrend(val: unknown): 'up' | 'down' | 'neutral' {
  const s = String(val ?? '').toLowerCase().trim()
  if (['up', 'increase', 'positive', 'growth', 'rise', 'gained'].some(k => s.includes(k))) return 'up'
  if (['down', 'decrease', 'negative', 'decline', 'drop', 'fell', 'lost'].some(k => s.includes(k))) return 'down'
  return 'neutral'
}

function normalizeStatus(val: unknown): 'success' | 'warning' | 'error' {
  const s = String(val ?? '').toLowerCase().trim()
  if (['success', 'healthy', 'good', 'optimal', 'excellent', 'achieved'].some(k => s.includes(k))) return 'success'
  if (['warning', 'caution', 'moderate', 'watch', 'degraded'].some(k => s.includes(k))) return 'warning'
  if (['error', 'critical', 'failing', 'poor', 'bad', 'missed'].some(k => s.includes(k))) return 'error'
  return 'success'
}

function normalizeGraphType(val: unknown): 'line' | 'bar' | 'pie' | 'area' {
  const s = String(val ?? '').toLowerCase().trim()
  if (s.includes('pie') || s.includes('share') || s.includes('proportion')) return 'pie'
  if (s.includes('bar') || s.includes('column') || s.includes('comparison') || s.includes('ranking')) return 'bar'
  if (s.includes('area')) return 'area'
  return 'line'
}

function normalizeVerdict(val: unknown): 'better' | 'worse' | 'same' {
  const s = String(val ?? '').toLowerCase().trim()
  if (['better', 'improved', 'increase', 'positive', 'higher'].some(k => s.includes(k))) return 'better'
  if (['worse', 'declined', 'decrease', 'negative', 'lower'].some(k => s.includes(k))) return 'worse'
  return 'same'
}

function normalizeSeverity(val: unknown): 'positive' | 'neutral' | 'negative' {
  const s = String(val ?? '').toLowerCase().trim()
  if (['positive', 'good', 'favorable', 'opportunity'].some(k => s.includes(k))) return 'positive'
  if (['negative', 'bad', 'unfavorable', 'risk', 'concern'].some(k => s.includes(k))) return 'negative'
  return 'neutral'
}

function normalizeAlertLevel(val: unknown): 'info' | 'warning' | 'critical' {
  const s = String(val ?? '').toLowerCase().trim()
  if (['critical', 'urgent', 'emergency', 'high'].some(k => s.includes(k))) return 'critical'
  if (['warning', 'alert', 'caution', 'medium'].some(k => s.includes(k))) return 'warning'
  return 'info'
}

function normalizeBadgeStatus(val: unknown): 'success' | 'warning' | 'error' | 'loading' | 'idle' {
  const s = String(val ?? '').toLowerCase().trim()
  if (['success', 'healthy', 'good', 'operational'].some(k => s.includes(k))) return 'success'
  if (['warning', 'caution', 'degraded'].some(k => s.includes(k))) return 'warning'
  if (['error', 'critical', 'failing', 'down'].some(k => s.includes(k))) return 'error'
  if (['loading', 'pending', 'starting'].some(k => s.includes(k))) return 'loading'
  return 'idle'
}

// ─── Schemas (Zod v4 compatible) ─────────────────────────────────────────────

export const metricCardSchema = z.object({
  title: z.string().optional().default('Business Metric'),
  value: z.string().optional().default('N/A'),
  trend: z.preprocess(normalizeTrend, z.enum(['up', 'down', 'neutral'])).optional(),
  change: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.enum(['blue', 'green', 'red', 'yellow', 'purple', 'gray']).optional().default('blue'),
  precision: z.number().optional().default(2),
  unit: z.string().optional(),
  comparison: z.string().optional(),
})

export const statusBadgeSchema = z.object({
  label: z.string().optional().default('Business Status'),
  status: z.preprocess(normalizeStatus, z.enum(['success', 'warning', 'error'])).optional(),
  value: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  lastUpdated: z.string().optional(),
  uptime: z.string().optional(),
  metrics: z.array(z.object({
    label: z.string(),
    value: z.string(),
    status: z.enum(['good', 'warning', 'bad']),
  })).optional(),
})

export const graphCardSchema = z.object({
  title: z.string().optional().default('Business Trend'),
  type: z.preprocess(normalizeGraphType, z.enum(['line', 'bar', 'pie', 'area'])).optional(),
  data: z.array(z.object({
    label: z.string().optional(),
    value: z.number().optional().default(0),
  })).optional(),
  xAxisLabel: z.string().optional(),
  yAxisLabel: z.string().optional(),
  showGrid: z.boolean().optional().default(true),
  showLegend: z.boolean().optional().default(false),
  colorScheme: z.enum(['blue', 'green', 'red', 'purple', 'multi']).optional().default('blue'),
  height: z.number().optional().default(280),
  timeRange: z.string().optional(),
})

export const businessSummaryTableSchema = z.object({
  title: z.string().optional().default('Business Summary'),
  columns: z.array(z.string()).optional().default(['Metric', 'Value', 'Status']),
  rows: z.array(z.object({
    item: z.string().optional().default('Metric'),
    value: z.string().optional().default('N/A'),
    status: z.preprocess(normalizeStatus, z.enum(['success', 'warning', 'error'])).optional(),
    change: z.string().optional(),
    trend: z.preprocess(normalizeTrend, z.enum(['up', 'down', 'neutral'])).optional(),
    description: z.string().optional(),
  })).optional(),
  sortable: z.boolean().optional().default(true),
  pagination: z.boolean().optional().default(false),
  pageSize: z.number().optional().default(10),
  highlightRow: z.number().optional(),
})

export const insightCardSchema = z.object({
  title: z.string().optional().default('Business Insight'),
  insight: z.string().optional().default('Analysis in progress...'),
  severity: z.preprocess(normalizeSeverity, z.enum(['positive', 'neutral', 'negative', 'critical'])).optional(),
  recommendations: z.array(z.string()).optional(),
  confidence: z.number().optional().default(85),
  sources: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  actionItems: z.array(z.object({
    title: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    deadline: z.string().optional(),
  })).optional(),
})

export const comparisonCardSchema = z.object({
  title: z.string().optional().default('Business Comparison'),
  leftLabel: z.string().optional().default('Current Period'),
  leftValue: z.string().optional().default('$0'),
  rightLabel: z.string().optional().default('Previous Period'),
  rightValue: z.string().optional().default('$0'),
  difference: z.string().optional().default('$0'),
  percentageChange: z.string().optional().default('0%'),
  verdict: z.preprocess(normalizeVerdict, z.enum(['better', 'worse', 'same'])).optional(),
  metrics: z.array(z.object({
    name: z.string(),
    leftValue: z.union([z.string(), z.number()]),
    rightValue: z.union([z.string(), z.number()]),
    change: z.string(),
  })).optional(),
  insights: z.array(z.string()).optional(),
})

export const alertListSchema = z.object({
  title: z.string().optional().default('Business Alerts'),
  alerts: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    level: z.preprocess(normalizeAlertLevel, z.enum(['info', 'warning', 'critical'])).optional(),
    timestamp: z.string().optional(),
    action: z.string().optional(),
    assignedTo: z.string().optional(),
    status: z.enum(['new', 'in-progress', 'resolved', 'acknowledged']).optional().default('new'),
    category: z.string().optional(),
  })).optional(),
  autoRefresh: z.boolean().optional().default(true),
  refreshInterval: z.number().optional().default(60),
  maxAlerts: z.number().optional().default(20),
  grouping: z.enum(['level', 'category', 'status']).optional(),
})

// ─── Types ────────────────────────────────────────────────────────────────────

export type MetricCardProps       = z.infer<typeof metricCardSchema>
export type StatusBadgeProps      = z.infer<typeof statusBadgeSchema>
export type GraphCardProps        = z.infer<typeof graphCardSchema>
export type BusinessSummaryTableProps = z.infer<typeof businessSummaryTableSchema>
export type InsightCardProps      = z.infer<typeof insightCardSchema>
export type ComparisonCardProps   = z.infer<typeof comparisonCardSchema>
export type AlertListProps        = z.infer<typeof alertListSchema>

// ─── Component Registration ───────────────────────────────────────────────────

export function registerTamboComponents(): TamboComponent[] {
  return [
    {
      name: 'MetricCard',
      description: 'Display a single business KPI with value and trend indicator. Use for revenue, users, growth rates, etc.',
      component: MetricCard,
      propsSchema: metricCardSchema,
    },
    {
      name: 'StatusBadge',
      description: 'Show business health or operational status (success/warning/error). Use for system health, financial status, etc.',
      component: StatusBadge,
      propsSchema: statusBadgeSchema,
    },
    {
      name: 'GraphCard',
      description: 'Visualize data with line, bar, pie, or area charts. Use line for trends, bar for comparisons, pie for proportions.',
      component: GraphCard,
      propsSchema: graphCardSchema,
    },
    {
      name: 'BusinessSummaryTable',
      description: 'Display multiple business metrics in a table with status indicators. Use for dashboards or multi-KPI summaries.',
      component: BusinessSummaryTable,
      propsSchema: businessSummaryTableSchema,
    },
    {
      name: 'InsightCard',
      description: 'Present AI-generated business insights and recommendations. Use for analysis results and strategic recommendations.',
      component: InsightCard,
      propsSchema: insightCardSchema,
    },
    {
      name: 'ComparisonCard',
      description: 'Compare two business values side by side (e.g., Q1 vs Q2, current vs target). Includes verdict and percentage change.',
      component: ComparisonCard,
      propsSchema: comparisonCardSchema,
    },
    {
      name: 'AlertList',
      description: 'Display prioritized business alerts with severity levels (info/warning/critical), timestamps, and recommended actions.',
      component: AlertList,
      propsSchema: alertListSchema,
    },
  ]
}

// ─── Helper ───────────────────────────────────────────────────────────────────

export function getComponentType(name: string): string {
  const map: Record<string, string> = {
    MetricCard: 'metric',
    GraphCard: 'graph',
    BusinessSummaryTable: 'table',
    ComparisonCard: 'comparison',
    InsightCard: 'insight',
    AlertList: 'alert',
    StatusBadge: 'status',
  }
  return map[name] ?? 'unknown'
}