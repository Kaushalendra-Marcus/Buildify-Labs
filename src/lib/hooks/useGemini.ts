'use client'

import { useState, useCallback } from 'react'
import { GeminiAnalysisResult } from '@/lib/services/gemini'

interface UseGeminiOptions {
  onSuccess?: (result: GeminiAnalysisResult) => void
  onError?: (error: Error) => void
}

export function useGemini(options?: UseGeminiOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GeminiAnalysisResult | null>(null)

  const analyze = useCallback(
    async (
      query: string,
      uploadedData?: string,
      context?: string
    ) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/gemini/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, data: uploadedData, context }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Analysis failed')
        }

        const data: GeminiAnalysisResult = await response.json()
        setResult(data)
        options?.onSuccess?.(data)
        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error.message)
        options?.onError?.(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [options]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setResult(null)
  }, [])

  return {
    analyze,
    loading,
    error,
    result,
    reset,
  }
}
