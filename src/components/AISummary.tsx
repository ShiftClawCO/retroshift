'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Entry } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, RefreshCw, Check, Loader2, AlertCircle, Bot, Lock, Crown } from 'lucide-react'

interface AISummaryProps {
  retroId: string
  entries: Entry[]
  isPro?: boolean
}

export default function AISummary({ retroId, entries, isPro = false }: AISummaryProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastEntriesHash, setLastEntriesHash] = useState<string | null>(null)

  const entriesHash = useMemo(() => {
    if (entries.length === 0) return ''
    const content = entries
      .map(e => `${e.category}:${e.content}`)
      .sort()
      .join('|')
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }, [entries])

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

  if (entries.length === 0) {
    return null
  }

  // Free tier teaser - show locked state
  if (!isPro) {
    return (
      <Card className="mb-8 border-purple-500/30 bg-purple-500/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10" />
        <CardHeader className="relative z-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" />
                {t('summary.title')}
              </CardTitle>
              <Badge variant="outline" className="text-xs gap-1 border-amber-500 text-amber-500">
                <Crown className="w-3 h-3" />
                Pro
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-0">
          <div className="border border-dashed rounded-lg p-6 text-center">
            <Lock className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {t('summary.proFeature') || 'AI-powered summaries are available for Pro users.'}
            </p>
            <Button asChild size="sm">
              <Link href="/pricing">
                <Crown className="w-4 h-4 mr-2" />
                {t('summary.upgradeToPro') || 'Upgrade to Pro'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8 border-purple-500/30 bg-purple-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-500" />
              {t('summary.title')}
            </CardTitle>
            {summary && !hasNewFeedback && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Check className="w-3 h-3" />
                {t('summary.upToDate')}
              </Badge>
            )}
            {summary && hasNewFeedback && (
              <Badge variant="outline" className="text-xs border-amber-500 text-amber-500 gap-1">
                <AlertCircle className="w-3 h-3" />
                {t('summary.newFeedback')}
              </Badge>
            )}
          </div>
          
          <Button
            onClick={generateSummary}
            disabled={loading || (!!summary && !hasNewFeedback)}
            variant={canGenerate ? 'default' : 'secondary'}
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('summary.generating')}
              </>
            ) : summary ? (
              hasNewFeedback ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('summary.regenerate')}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {t('summary.generated')}
                </>
              )
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t('summary.generate')}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {parsedSummary ? (
          <div className="bg-background rounded-lg p-5 border">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {parsedSummary.lines.map((line, i) => {
                const isAction = line.toLowerCase().includes('action') || line.toLowerCase().includes('azione')
                
                if (line.startsWith('**') || line.startsWith('##')) {
                  return (
                    <h4 key={i} className="text-primary font-semibold mt-4 mb-2 text-sm">
                      {line.replace(/[#*]/g, '').trim()}
                    </h4>
                  )
                }
                
                if (/^\d+\./.test(line)) {
                  return (
                    <div key={i} className={`flex gap-2 py-1 ${isAction ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                      <span className="text-primary font-mono">{line.match(/^\d+/)?.[0]}.</span>
                      <span>{line.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  )
                }
                
                if (/^[•\-\*]/.test(line)) {
                  return (
                    <div key={i} className="flex gap-2 py-1">
                      <span className="text-purple-500">•</span>
                      <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                    </div>
                  )
                }
                
                return (
                  <p key={i} className="leading-relaxed py-1">
                    {line}
                  </p>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="border border-dashed rounded-lg p-4">
            <CardDescription className="text-center">
              {t('summary.description')}
            </CardDescription>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
