'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { supabase, Retro, Entry, Vote, FORMATS, FormatKey } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Header from '@/components/Header'
import VoteButtons from '@/components/VoteButtons'
import AISummary from '@/components/AISummary'
import Leaderboard from '@/components/Leaderboard'

export default function DashboardPage() {
  const params = useParams()
  const code = params.code as string
  const t = useTranslations()
  const locale = useLocale()
  
  const [retro, setRetro] = useState<Retro | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const loadData = useCallback(async () => {
    const { data: retroData, error: retroError } = await supabase
      .from('retros')
      .select('*')
      .eq('access_code', code)
      .single()

    if (retroError || !retroData) {
      setError(t('participate.notFound'))
      setLoading(false)
      return null
    }

    setRetro(retroData)

    const { data: entriesData } = await supabase
      .from('entries')
      .select('*')
      .eq('retro_id', retroData.id)
      .order('created_at', { ascending: true })

    setEntries(entriesData || [])

    if (entriesData && entriesData.length > 0) {
      const entryIds = entriesData.map(e => e.id)
      const { data: votesData } = await supabase
        .from('votes')
        .select('*')
        .in('entry_id', entryIds)
      
      setVotes(votesData || [])
    }

    setLoading(false)
    return retroData
  }, [code, t])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    let pollInterval: NodeJS.Timeout | null = null

    const setup = async () => {
      const retroData = await loadData()
      
      if (retroData) {
        channel = supabase
          .channel(`entries-${retroData.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'entries',
              filter: `retro_id=eq.${retroData.id}`,
            },
            (payload) => {
              setEntries(prev => {
                if (prev.some(e => e.id === (payload.new as Entry).id)) return prev
                return [...prev, payload.new as Entry]
              })
            }
          )
          .subscribe((status) => {
            console.log('Realtime status:', status)
          })

        pollInterval = setInterval(async () => {
          const { data: entriesData } = await supabase
            .from('entries')
            .select('*')
            .eq('retro_id', retroData.id)
            .order('created_at', { ascending: true })
          
          if (entriesData) {
            setEntries(prev => {
              if (entriesData.length !== prev.length) {
                return entriesData
              }
              return prev
            })
          }
        }, 5000)
      }
    }

    setup()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [loadData])

  const copyShareLink = () => {
    const url = `${window.location.origin}/r/${code}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleClose = async () => {
    if (!retro) return
    
    const { error: updateError } = await supabase
      .from('retros')
      .update({ is_closed: !retro.is_closed })
      .eq('id', retro.id)

    if (!updateError) {
      setRetro(prev => prev ? { ...prev, is_closed: !prev.is_closed } : null)
    }
  }

  const getVotesForEntry = (entryId: string) => {
    return votes.filter(v => v.entry_id === entryId)
  }

  const handleVoteChange = (entryId: string, newVotes: Vote[]) => {
    setVotes(prev => {
      const otherVotes = prev.filter(v => v.entry_id !== entryId)
      return [...otherVotes, ...newVotes]
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-6">
          <CardContent>
            <div className="text-destructive mb-4">{error}</div>
            <Button asChild variant="outline">
              <Link href="/">{t('common.backHome')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const format = FORMATS[retro!.format as FormatKey]
  const entriesByCategory = format.categories.reduce((acc, cat) => {
    acc[cat] = entries.filter(e => e.category === cat)
    return acc
  }, {} as Record<string, Entry[]>)

  const getCategoryStyles = (category: string) => {
    const colorMap: Record<string, string> = {
      start: 'border-l-green-500 bg-green-500/5',
      stop: 'border-l-red-500 bg-red-500/5',
      continue: 'border-l-blue-500 bg-blue-500/5',
      mad: 'border-l-red-500 bg-red-500/5',
      sad: 'border-l-blue-500 bg-blue-500/5',
      glad: 'border-l-green-500 bg-green-500/5',
      liked: 'border-l-pink-500 bg-pink-500/5',
      learned: 'border-l-yellow-500 bg-yellow-500/5',
      lacked: 'border-l-gray-500 bg-gray-500/5',
    }
    return colorMap[category] || ''
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Link href="/" className="text-muted-foreground hover:text-foreground text-sm mb-2 inline-block">
              ← {t('common.backHome')}
            </Link>
            <h1 className="text-2xl font-bold">{retro!.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t('dashboard.feedbackCount', { count: entries.length })} • {t(`formats.${retro!.format}.name`)}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={copyShareLink}>
              {copied ? t('dashboard.copied') : t('dashboard.copyLink')}
            </Button>
            <Button
              variant={retro!.is_closed ? 'default' : 'destructive'}
              onClick={toggleClose}
            >
              {retro!.is_closed ? t('dashboard.reopen') : t('dashboard.close')}
            </Button>
          </div>
        </div>

        {/* Share banner */}
        {entries.length === 0 && (
          <Card className="border-primary bg-primary/5 mb-8">
            <CardHeader>
              <CardTitle className="text-lg">{t('dashboard.shareTitle')}</CardTitle>
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
                  {copied ? t('dashboard.copied') : t('dashboard.copy')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Summary */}
        <AISummary retroId={retro!.id} entries={entries} />

        {/* Leaderboard */}
        <Leaderboard entries={entries} votes={votes} />

        {/* Closed banner */}
        {retro!.is_closed && (
          <Card className="border-destructive bg-destructive/5 mb-8">
            <CardContent className="flex items-center gap-2 py-4">
              <span>🔒</span>
              <span>{t('dashboard.closedBanner')}</span>
            </CardContent>
          </Card>
        )}

        {/* Entries grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {format.categories.map((category) => (
            <div key={category} className="space-y-4">
              <Card className={`border-l-4 ${getCategoryStyles(category)}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {t(`formats.${retro!.format}.${category}`)}
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
                  <Card key={entry.id}>
                    <CardContent className="pt-4">
                      <p className="whitespace-pre-wrap">{entry.content}</p>
                      <p className="text-muted-foreground text-xs mt-2">
                        {new Date(entry.created_at).toLocaleString(locale === 'it' ? 'it-IT' : 'en-US')}
                      </p>
                      <VoteButtons 
                        entryId={entry.id} 
                        initialVotes={getVotesForEntry(entry.id)}
                        onVoteChange={(newVotes) => handleVoteChange(entry.id, newVotes)}
                      />
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ))}
        </div>

        {/* Refresh hint */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          {t('dashboard.autoRefresh')}
        </p>
      </div>
    </div>
  )
}
