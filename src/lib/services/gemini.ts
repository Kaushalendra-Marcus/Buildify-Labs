import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export interface GeminiAnalysisResult {
  components: Array<{
    type: 'metric' | 'graph' | 'table' | 'comparison' | 'insight' | 'alert' | 'status'
    title: string
    data: Record<string, any>
  }>
  summary: string
  insights: string[]
}

export async function analyzeDataWithGemini(
  userQuery: string,
  uploadedData?: string,
  context?: string
): Promise<GeminiAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const systemPrompt = `You are an expert business analyst and data visualization specialist. 
Your task is to:
1. Analyze business data and user queries
2. Generate accurate insights based on real data
3. Recommend appropriate visualizations
4. Provide component data in structured JSON format

When analyzing data, focus on:
- Accuracy: Provide real numbers and percentages (no made-up data)
- Relevance: Choose metrics that matter for the query
- Actionability: Generate insights that lead to decisions
- Completeness: Suggest multiple component types for comprehensive view

Always respond in JSON format with this structure:
{
  "components": [
    {
      "type": "metric|graph|table|comparison|insight|alert|status",
      "title": "Component title",
      "data": { ...component specific data }
    }
  ],
  "summary": "Brief summary of analysis",
  "insights": ["insight 1", "insight 2", "insight 3"]
}

For metric components, use realistic data. For graphs, provide actual data points.`

    const userMessage = `
${context ? `Context: ${context}\n` : ''}
User Query: ${userQuery}
${uploadedData ? `\nData:\n${uploadedData}` : ''}

Analyze this and provide visualization recommendations with real, accurate data.
`

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userMessage },
    ])

    const response = result.response
    const text = response.text()

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse response')
    }

    const analysisResult: GeminiAnalysisResult = JSON.parse(jsonMatch[0])
    return analysisResult
  } catch (error) {
    console.error('Gemini analysis error:', error)
    throw error
  }
}

export async function generateDataInsights(
  data: Record<string, any>,
  queryContext: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `Analyze this business data and provide 3-5 key insights:

Data: ${JSON.stringify(data)}
Context: ${queryContext}

Provide actionable, specific insights based on real data analysis.`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('Gemini insights error:', error)
    throw error
  }
}

export async function chat(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const messages = conversationHistory.map(msg => ({
      role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({
      history: messages.slice(0, -1),
    })

    const result = await chat.sendMessage(userMessage)
    return result.response.text()
  } catch (error) {
    console.error('Gemini chat error:', error)
    throw error
  }
}
