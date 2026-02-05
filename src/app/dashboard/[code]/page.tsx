'use client'

import { useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useAuth } from '@/components/AuthProvider'
import { FORMATS, FormatKey, type Entry, type Vote } from '@/lib/types'
import { getCategoryConfig } from '@/lib/category-icons'
import { generateRetroPdf } from '@/lib/pdf-export'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Lock, LockOpen, Link2, Check, Share2, FileDown, Loader2, Crown } from 'lucide-react'
import Header from '@/components/Header'
import VoteButtons from '@/components/VoteButtons'
import AISummary from '@/components/AISummary'
import Leaderboard from '@/components/Leaderboard'
import KeyboardHints from '@/components/KeyboardHints'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export default function DashboardPage() {
  const params = useParams()
  const code = params.code as string
  const t = useTranslations()
  const locale = useLocale()
  const { user: workosUser } = useAuth()

  const [copied, setCopied] = useState(false)
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const aiSummaryRef = useRef<string | null>(null)

  // Convex queries
  const retro = useQuery(api.retros.getByCode, { code })
  const convexUser = useQuery(
    api.users.getByWorkosId,
    workosUser ? { workosId: workosUser.id } : 'skip'
  )
  const entries = useQuery(
    api.entries.listByRetro,
    retro ? { retroId: retro._id } : "skip"
  )
  const allVotes = useQuery(
    api.votes.listByEntries,
    entries && entries.length > 0
      ? { entryIds: entries.map(e => e._id) }
      : "skip"
  )

  // Convex mutations
  const toggleCloseMutation = useMutation(api.retros.toggleClose)

  // Loading state
  const loading = retro === undefined

  // Check if user is Pro
  const isPro = convexUser?.plan === 'pro'

  const copyShareLink = useCallback(() => {
    const url = `${window.location.origin}/r/${code}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const toggleClose = useCallback(async () => {
    if (!retro) return
    try {
      await toggleCloseMutation({ id: retro._id })
    } catch (err) {
      console.error('Error toggling retro:', err)
    }
  }, [retro, toggleCloseMutation])

  const handleExportPdf = useCallback(async () => {
    if (!retro || !isPro || pdfGenerating) return
    setPdfGenerating(true)
    try {
      const fmt = retro.format as FormatKey
      const formatDef = FORMATS[fmt]
      const categoryLabels: Record<string, string> = {}
      for (const cat of formatDef.categories) {
        categoryLabels[cat] = t(`formats.${retro.format}.${cat}`)
      }
      generateRetroPdf({
        title: retro.title,
        format: fmt,
        createdAt: retro.createdAt,
        entries: (entries || []) as Entry[],
        votes: (allVotes || []) as Vote[],
        aiSummary: aiSummaryRef.current,
        locale,
        translations: {
          exportTitle: t('dashboard.exportPdf'),
          categoryLabels,
          formatName: t(`formats.${retro.format}.name`),
          votesLabel: t('dashboard.pdfVotes'),
          summaryTitle: t('dashboard.pdfSummaryTitle'),
          noEntries: t('dashboard.pdfNoEntries'),
          generatedAt: t('dashboard.pdfGeneratedAt'),
        },
      })
    } finally {
      setPdfGenerating(false)
    }
  }, [retro, isPro, pdfGenerating, entries, allVotes, locale, t])

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'c', action: copyShareLink, description: 'Copy share link' },
    { key: 'l', action: toggleClose, description: 'Lock/Unlock retro' },
  ])

  const keyboardHints = [
    { keys: ['C'], description: 'Copy link' },
    { keys: ['L'], description: 'Lock/Unlock' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    )
  }

  if (!retro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-6">
          <CardContent>
            <div className="text-destructive mb-4">{t('participate.notFound')}</div>
            <Button asChild variant="outline">
              <Link href="/">{t('common.backHome')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ownership check: only the retro creator can see the dashboard
  const ownershipLoading = workosUser && convexUser === undefined
  const isOwner = convexUser && retro.userId === convexUser._id

  if (ownershipLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    )
  }

  if (!workosUser || !isOwner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-6 max-w-md">
          <CardContent>
            <Lock className="w-8 h-8 text-destructive mx-auto mb-4" />
            <div className="text-destructive font-semibold mb-2">{t('dashboard.accessDenied')}</div>
            <div className="text-muted-foreground text-sm mb-4">{t('dashboard.accessDeniedDesc')}</div>
            <Button asChild variant="outline">
              <Link href="/">{t('common.backHome')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const format = FORMATS[retro.format as FormatKey]
  const entriesList = entries || []
  const votesList = allVotes || []

  const entriesByCategory = format.categories.reduce((acc, cat) => {
    acc[cat] = entriesList.filter(e => e.category === cat)
    return acc
  }, {} as Record<string, Entry[]>)

  const getVotesForEntry = (entryId: string) => {
    return votesList.filter(v => v.entryId === entryId) as Vote[]
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Link href="/" className="text-muted-foreground hover:text-foreground text-sm mb-2 inline-block">
              ← {t('common.backHome')}
            </Link>
            <h1 className="text-2xl font-bold">{retro.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t('dashboard.feedbackCount', { count: entriesList.length })} • {t(`formats.${retro.format}.name`)}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={copyShareLink}>
              {copied ? (
                <><Check className="w-4 h-4 mr-2" /> {t('dashboard.copied')}</>
              ) : (
                <><Link2 className="w-4 h-4 mr-2" /> {t('dashboard.copyLink')}</>
              )}
            </Button>
            {isPro ? (
              <Button
                variant="outline"
                onClick={handleExportPdf}
                disabled={pdfGenerating}
              >
                {pdfGenerating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('dashboard.generating')}</>
                ) : (
                  <><FileDown className="w-4 h-4 mr-2" /> {t('dashboard.exportPdf')}</>
                )}
              </Button>
            ) : (
              <Button variant="outline" asChild className="text-muted-foreground">
                <Link href="/pricing">
                  <Crown className="w-4 h-4 mr-2" />
                  {t('dashboard.exportPdfPro')}
                </Link>
              </Button>
            )}
            <Button
              variant={retro.isClosed ? 'default' : 'destructive'}
              onClick={toggleClose}
            >
              {retro.isClosed ? (
                <><LockOpen className="w-4 h-4 mr-2" /> {t('dashboard.reopen')}</>
              ) : (
                <><Lock className="w-4 h-4 mr-2" /> {t('dashboard.close')}</>
              )}
            </Button>
          </div>
        </div>

        {/* Share banner */}
        {entriesList.length === 0 && (
          <Card className="border-primary bg-primary/5 mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                {t('dashboard.shareTitle')}
              </CardTitle>
              <CardDescription>{t('dashboard.shareDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/r/${code}`}
                  className="flex-1"
                />
                <Button onClick={copyShareLink}>
                  {copied ? <><Check className="w-4 h-4 mr-2" /> {t('dashboard.copied')}</> : t('dashboard.copy')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Summary */}
        <AISummary retroTitle={retro.title} entries={entriesList} isPro={isPro} onSummaryChange={(s) => { aiSummaryRef.current = s }} />

        {/* Leaderboard */}
        <Leaderboard entries={entriesList} votes={votesList} />

        {/* Closed banner */}
        {retro.isClosed && (
          <Card className="border-destructive bg-destructive/5 mb-8">
            <CardContent className="flex items-center gap-2 py-4">
              <Lock className="w-4 h-4 text-destructive" />
              <span>{t('dashboard.closedBanner')}</span>
            </CardContent>
          </Card>
        )}

        {/* Entries grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {format.categories.map((category) => {
            const config = getCategoryConfig(category)
            const IconComponent = config.icon
            return (
              <div key={category} className="space-y-4">
                <Card className={`border-l-4 ${config.border} ${config.bg}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2.5">
                      <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                      <span>{t(`formats.${retro.format}.${category}`)}</span>
                    </CardTitle>
                    <CardDescription>
                      {t('dashboard.responses', { count: entriesByCategory[category].length })}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {entriesByCategory[category].length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center text-muted-foreground text-sm">
                      {t('dashboard.noFeedback')}
                    </CardContent>
                  </Card>
                ) : (
                  entriesByCategory[category].map((entry) => (
                    <Card key={entry._id} className="transition-all hover:shadow-md">
                      <CardContent className="pt-4">
                        <p className="whitespace-pre-wrap">{entry.content}</p>
                        <p className="text-muted-foreground text-xs mt-2">
                          {new Date(entry.createdAt).toLocaleString(locale === 'it' ? 'it-IT' : 'en-US')}
                        </p>
                        <VoteButtons
                          entryId={entry._id}
                          initialVotes={getVotesForEntry(entry._id)}
                        />
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )
          })}
        </div>

        {/* Refresh hint */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          {t('dashboard.autoRefresh')}
        </p>
      </main>

      <KeyboardHints hints={keyboardHints} />
    </div>
  )
}
