'use client'

import { useState, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Entry } from '@/lib/supabase'

interface AISummaryProps {
  retroId: string
  entries: Entry[]
}

export default function AISummary({ retroId, entries }: AISummaryProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastEntriesHash, setLastEntriesHash] = useState<string | null>(null)

  // Create a hash of entries to detect changes
  const entriesHash = useMemo(() => {
    if (entries.length === 0) return ''
    const content = entries
      .map(e => `${e.category}:${e.content}`)
      .sort()
      .join('|')
    // Use a simple hash instead of btoa to avoid encoding issues
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }, [entries])

  // Parse summary into sections - MUST be before any conditional return
  const parsedSummary = useMemo(() => {
    if (!summary) return null
    const lines = summary.split('\n').filter(l => l.trim())
    return { raw: summary, lines }
  }, [summary])

  const hasNewFeedback = lastEntriesHash !== entriesHash && lastEntriesHash !== null
  const canGenerate = entries.length > 0 && (!lastEntriesHash || hasNewFeedback || !summary)

  const generateSummary = async () => {
    if (loading) return

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
      setLastEntriesHash(entriesHash)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Conditional return AFTER all hooks
  if (entries.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-slate-800 border border-purple-500/30 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          {t('summary.title')}
        </h3>
        
        <div className="flex items-center gap-2">
          {summary && !hasNewFeedback && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              ✓ {t('summary.upToDate')}
            </span>
          )}
          {summary && hasNewFeedback && (
            <span className="text-xs text-amber-400 flex items-center gap-1">
              ⚠ {t('summary.newFeedback')}
            </span>
          )}
          
          <button
            onClick={generateSummary}
            disabled={loading || (!!summary && !hasNewFeedback)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              loading
                ? 'bg-slate-700 text-slate-400 cursor-wait'
                : canGenerate
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                {t('summary.generating')}
              </>
            ) : summary ? (
              hasNewFeedback ? (
                <>🔄 {t('summary.regenerate')}</>
              ) : (
                <>✓ {t('summary.generated')}</>
              )
            ) : (
              <>✨ {t('summary.generate')}</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {parsedSummary ? (
        <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700">
          <div className="prose prose-invert prose-sm max-w-none">
            {parsedSummary.lines.map((line, i) => {
              const isAction = line.toLowerCase().includes('action') || line.toLowerCase().includes('azione')
              
              if (line.startsWith('**') || line.startsWith('##')) {
                return (
                  <h4 key={i} className="text-emerald-400 font-semibold mt-4 mb-2 text-sm">
                    {line.replace(/[#*]/g, '').trim()}
                  </h4>
                )
              }
              
              if (/^\d+\./.test(line)) {
                return (
                  <div key={i} className={`flex gap-2 py-1 ${isAction ? 'text-amber-300' : 'text-slate-300'}`}>
                    <span className="text-emerald-400 font-mono">{line.match(/^\d+/)?.[0]}.</span>
                    <span>{line.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                )
              }
              
              if (/^[•\-\*]/.test(line)) {
                return (
                  <div key={i} className="flex gap-2 py-1 text-slate-300">
                    <span className="text-purple-400">•</span>
                    <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                  </div>
                )
              }
              
              return (
                <p key={i} className="text-slate-300 leading-relaxed py-1">
                  {line}
                </p>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/30 rounded-lg p-4 border border-dashed border-slate-700">
          <p className="text-slate-500 text-sm text-center">
            {t('summary.description')}
          </p>
        </div>
      )}
    </div>
  )
}
