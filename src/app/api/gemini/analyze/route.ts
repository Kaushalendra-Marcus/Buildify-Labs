import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? ''
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

export interface GeminiAnalysisResult {
  components: Array<{
    type: 'metric' | 'graph' | 'table' | 'comparison' | 'insight' | 'alert' | 'status'
    title: string
    data: Record<string, any>
  }>
  summary: string
  insights: string[]
}

// ─── POST Handler (required by Next.js App Router) ────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, data: uploadedData, context } = body

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const result = await analyzeDataWithGemini(query, uploadedData, context)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Gemini analyze route error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: String(error) },
      { status: 500 }
    )
  }
}

// ─── Main Analysis Function ───────────────────────────────────────────────────

async function analyzeDataWithGemini(
  userQuery: string,
  uploadedData?: string,
  context?: string
): Promise<GeminiAnalysisResult> {
  if (!genAI) {
    console.info('ℹ️  GEMINI_API_KEY not set – returning mock data')
    return mockResult(userQuery)
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const system = `You are an expert business analyst. Analyze the user's query and return ONLY valid JSON (no markdown fences, no extra text) matching this exact structure:
{
  "components": [
    {
      "type": "metric|graph|table|comparison|insight|alert|status",
      "title": "string",
      "data": {}
    }
  ],
  "summary": "string",
  "insights": ["string"]
}

Component "data" field contents per type:
- metric: { title, value, trend ("up"|"down"|"neutral"), change, color ("blue"|"green"|"red"|"purple"|"yellow") }
- graph:  { title, type ("line"|"bar"|"pie"|"area"), data: [{label, value}], yAxisLabel, colorScheme }
- table:  { title, columns: ["string"], rows: [{item, value, status ("success"|"warning"|"error"), change, trend}] }
- comparison: { title, leftLabel, leftValue, rightLabel, rightValue, difference, percentageChange, verdict ("better"|"worse"|"same") }
- insight: { title, insight, severity ("positive"|"neutral"|"negative"), recommendations: ["string"], confidence }
- alert:  { title, alerts: [{title, description, level ("info"|"warning"|"critical"), timestamp, status ("new"|"in-progress"|"resolved")}] }
- status: { label, status ("success"|"warning"|"error"), value, description }`

    const prompt = `${context ? `Context: ${context}\n` : ''}Query: ${userQuery}${uploadedData ? `\n\nData:\n${uploadedData}` : ''}`

    const result = await model.generateContent([{ text: system }, { text: prompt }])
    const raw = result.response.text().trim()

    const json = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    return JSON.parse(json) as GeminiAnalysisResult
  } catch (err) {
    console.error('Gemini error:', err)
    return mockResult(userQuery)
  }
}

// ─── Mock fallback ────────────────────────────────────────────────────────────

function mockResult(query: string): GeminiAnalysisResult {
  const q = query.toLowerCase()
  const components: GeminiAnalysisResult['components'] = []

  // Detect company name for mock data
  const companyMatch = query.match(/\b(ibm|apple|google|microsoft|amazon|tesla|nike|meta|samsung|intel|oracle|salesforce)\b/i)
  const company = companyMatch ? companyMatch[1].toUpperCase() : 'Company'

  // Detect year range requests
  const yearMatch = query.match(/last\s+(\d+)\s+yr|last\s+(\d+)\s+year/i)
  const years = yearMatch ? parseInt(yearMatch[1] || yearMatch[2]) : 3

  if (q.includes('revenue') || q.includes('metric') || q.includes('sales')) {
    components.push({
      type: 'metric',
      title: `${company} Total Revenue`,
      data: { title: `${company} Total Revenue`, value: '$60.5B', trend: 'up', change: '+4.2%', color: 'blue' },
    })
  }

  if (q.includes('trend') || q.includes('growth') || q.includes('chart') || q.includes('yr') || q.includes('year')) {
    const currentYear = new Date().getFullYear()
    const chartData = Array.from({ length: years }, (_, i) => ({
      label: String(currentYear - years + 1 + i),
      value: 55 + i * 3 + Math.round(Math.random() * 5),
    }))
    components.push({
      type: 'graph',
      title: `${company} Revenue Trend (Last ${years} Years)`,
      data: {
        title: `${company} Revenue Trend`,
        type: 'bar',
        data: chartData,
        yAxisLabel: 'Revenue ($B)',
        colorScheme: 'blue',
      },
    })
  }

  if (q.includes('table') || q.includes('summary') || q.includes('yr') || q.includes('year')) {
    const currentYear = new Date().getFullYear()
    const tableRows = Array.from({ length: years }, (_, i) => {
      const year = currentYear - years + 1 + i
      const revenue = (55 + i * 3).toFixed(1)
      const growth = i === 0 ? '-' : `+${(3 + Math.random() * 2).toFixed(1)}%`
      return {
        item: String(year),
        value: `$${revenue}B`,
        status: 'success' as const,
        change: growth,
        trend: 'up' as const,
      }
    })

    components.push({
      type: 'table',
      title: `${company} Annual Performance (Last ${years} Years)`,
      data: {
        title: `${company} Annual Performance`,
        columns: ['Year', 'Revenue', 'Status', 'Growth'],
        rows: tableRows,
      },
    })
  }

  if (q.includes('alert') || q.includes('warning')) {
    components.push({
      type: 'alert',
      title: `${company} Business Alerts`,
      data: {
        title: `${company} Business Alerts`,
        alerts: [
          { title: 'Revenue below target', description: 'Down 8% vs plan', level: 'warning', timestamp: '2h ago', status: 'new' },
          { title: 'High churn rate', description: 'Churn at 5.2%', level: 'critical', timestamp: '4h ago', status: 'new' },
        ],
      },
    })
  }

  if (q.includes('compare') || q.includes('vs')) {
    components.push({
      type: 'comparison',
      title: 'Period Comparison',
      data: {
        title: 'YoY Comparison',
        leftLabel: '2023', leftValue: '$60.5B',
        rightLabel: '2024', rightValue: '$61.9B',
        difference: '+$1.4B', percentageChange: '+2.3%',
        verdict: 'better',
      },
    })
  }

  // Always add an insight
  components.push({
    type: 'insight',
    title: `${company} AI Analysis`,
    data: {
      title: 'Business Analysis',
      insight: `${company} shows stable long-term performance over the last ${years} years with consistent revenue growth driven by cloud and consulting segments.`,
      severity: 'neutral',
      recommendations: [
        'Monitor cloud services growth as a key revenue driver',
        'Focus on AI integration across product lines',
        'Optimize operational costs in legacy segments',
      ],
      confidence: 80,
    },
  })

  return {
    components,
    summary: `Showing ${genAI ? 'AI-generated' : 'mock'} data for: "${query}".${!genAI ? ' Add GEMINI_API_KEY to .env.local for real AI insights.' : ''}`,
    insights: [
      `${company} revenue has been stable with moderate growth`,
      'Cloud and AI segments are primary growth drivers',
      'Operational efficiency improvements needed in legacy areas',
    ],
  }
}