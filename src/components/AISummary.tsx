'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'

interface AISummaryProps {
  retroId: string
  hasEntries: boolean
}

export default function AISummary({ retroId, hasEntries }: AISummaryProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSummary = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retroId, locale }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate summary')
      }

      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (!hasEntries) {
    return null
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🤖 {t('summary.title')}
        </h3>
        <button
          onClick={generateSummary}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              {t('summary.generating')}
            </>
          ) : summary ? (
            <>🔄 {t('summary.regenerate')}</>
          ) : (
            <>✨ {t('summary.generate')}</>
          )}
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {summary && (
        <div className="prose prose-invert max-w-none">
          <div className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
            {summary}
          </div>
        </div>
      )}

      {!summary && !loading && (
        <p className="text-slate-500 text-sm">
          {t('summary.description')}
        </p>
      )}
    </div>
  )
}
