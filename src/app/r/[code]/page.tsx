'use client'

import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { FORMATS, FormatKey, getParticipantId } from '@/lib/types'
import { getCategoryConfig } from '@/lib/category-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import Header from '@/components/Header'
import KeyboardHints from '@/components/KeyboardHints'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Lock, PartyPopper } from 'lucide-react'

export default function ParticipatePage() {
  const params = useParams()
  const code = params.code as string
  const t = useTranslations()
  
  const [entries, setEntries] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  // Convex queries & mutations
  const retro = useQuery(api.retros.getByCode, { code: code.toUpperCase() })
  const createBatch = useMutation(api.entries.createBatch)

  // Loading state
  const loading = retro === undefined

  // Initialize entries when retro loads
  const format = retro ? FORMATS[retro.format as FormatKey] : null
  
  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'Enter', meta: true, action: () => formRef.current?.requestSubmit(), description: 'Submit feedback' },
  ])

  const keyboardHints = [
    { keys: ['cmd', 'enter'], description: 'Submit' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const hasContent = Object.values(entries).some(v => v.trim())
    if (!hasContent) {
      setError(t('participate.errorEmpty'))
      return
    }

    setSubmitting(true)
    setError('')

    const feedbackEntries = Object.entries(entries)
      .filter(([_, content]) => content.trim())
      .map(([category, content]) => ({
        category,
        content: content.trim()
      }))

    try {
      await createBatch({
        retroId: retro!._id,
        entries: feedbackEntries,
        participantId: getParticipantId(),
      })
      setSubmitted(true)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : ''
      
      if (errorMessage === 'LINK_EXPIRED') {
        setError(t('participate.linkExpired') || 'This link has expired.')
      } else if (errorMessage === 'PARTICIPANT_LIMIT') {
        setError(t('participate.participantLimit') || 'Maximum participants reached.')
      } else if (errorMessage === 'RETRO_CLOSED') {
        setError(t('participate.closed'))
      } else {
        setError(t('participate.errorGeneric'))
      }
    } finally {
      setSubmitting(false)
    }
  }

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

  if (retro.isClosed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="text-center p-8 max-w-sm w-full">
          <CardContent className="pt-0">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl mb-2">{t('participate.closedTitle')}</CardTitle>
            <CardDescription className="mb-6">{t('participate.closed')}</CardDescription>
            <Button asChild>
              <Link href="/">{t('participate.createNew')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="text-center p-8 max-w-sm w-full">
          <CardContent className="pt-0">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <PartyPopper className="w-8 h-8 text-emerald-500" />
            </div>
            <CardTitle className="text-xl mb-2">{t('participate.thanks')}</CardTitle>
            <CardDescription className="mb-6">{t('participate.sent')}</CardDescription>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false)
                const resetEntries: Record<string, string> = {}
                format!.categories.forEach(cat => {
                  resetEntries[cat] = ''
                })
                setEntries(resetEntries)
              }}
            >
              {t('participate.addMore')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">{retro.title}</h1>
            <p className="text-muted-foreground">{t('participate.anonymous')}</p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            {format!.categories.map((category) => {
              const config = getCategoryConfig(category)
              const IconComponent = config.icon
              return (
                <Card 
                  key={category}
                  className={`border-l-4 ${config.border} ${config.bg} transition-all hover:shadow-md`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2.5 mb-3">
                      <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                      <span className="font-medium">{t(`formats.${retro.format}.${category}`)}</span>
                    </div>
                    <Textarea
                      value={entries[category] || ''}
                      onChange={(e) => setEntries(prev => ({ ...prev, [category]: e.target.value }))}
                      placeholder={t('participate.placeholder')}
                      rows={3}
                      className="resize-none"
                    />
                  </CardContent>
                </Card>
              )
            })}

            {error && (
              <div className="text-destructive text-sm text-center">{error}</div>
            )}

            <Button type="submit" disabled={submitting} size="lg" className="w-full font-semibold">
              {submitting ? t('participate.submitting') : t('participate.submit')}
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-10">
            Powered by <Link href="/" className="text-primary hover:underline font-medium">RetroShift</Link>
          </p>
        </div>
      </main>

      <KeyboardHints hints={keyboardHints} />
    </div>
  )
}
