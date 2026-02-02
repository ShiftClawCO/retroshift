'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { supabase, Retro, Entry, Vote, FORMATS, FormatKey } from '@/lib/supabase'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import VoteButtons from '@/components/VoteButtons'
import AISummary from '@/components/AISummary'

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

    // Load votes for all entries
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
              setEntries(prev => [...prev, payload.new as Entry])
            }
          )
          .subscribe()
      }
    }

    setup()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-slate-400">{t('common.loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <Link href="/" className="text-emerald-400 hover:text-emerald-300">
            {t('common.backHome')}
          </Link>
        </div>
      </div>
    )
  }

  const format = FORMATS[retro!.format as FormatKey]
  const entriesByCategory = format.categories.reduce((acc, cat) => {
    acc[cat] = entries.filter(e => e.category === cat)
    return acc
  }, {} as Record<string, Entry[]>)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher currentLocale={locale} />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Link href="/" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
              ← {t('common.backHome')}
            </Link>
            <h1 className="text-2xl font-bold text-white">{retro!.title}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {t('dashboard.feedbackCount', { count: entries.length })} • {t(`formats.${retro!.format}.name`)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyShareLink}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {copied ? t('dashboard.copied') : t('dashboard.copyLink')}
            </button>
            <button
              onClick={toggleClose}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                retro!.is_closed
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {retro!.is_closed ? t('dashboard.reopen') : t('dashboard.close')}
            </button>
          </div>
        </div>

        {/* Share banner */}
        {entries.length === 0 && (
          <div className="bg-emerald-900/30 border border-emerald-600 rounded-lg p-6 mb-8">
            <h3 className="text-emerald-400 font-semibold mb-2">{t('dashboard.shareTitle')}</h3>
            <p className="text-slate-300 text-sm mb-4">
              {t('dashboard.shareDesc')}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/r/${code}`}
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-300 text-sm"
              />
              <button
                onClick={copyShareLink}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {copied ? t('dashboard.copied') : t('dashboard.copy')}
              </button>
            </div>
          </div>
        )}

        {/* AI Summary */}
        <AISummary retroId={retro!.id} hasEntries={entries.length > 0} />

        {/* Closed banner */}
        {retro!.is_closed && (
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 mb-8 flex items-center justify-between">
            <span className="text-slate-300">🔒 {t('dashboard.closedBanner')}</span>
          </div>
        )}

        {/* Entries grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {format.categories.map((category) => (
            <div key={category} className="space-y-4">
              <div className={`p-4 rounded-lg border ${format.colors[category as keyof typeof format.colors]}`}>
                <h2 className="text-lg font-semibold text-slate-800">
                  {t(`formats.${retro!.format}.${category}`)}
                </h2>
                <p className="text-slate-600 text-sm">
                  {t('dashboard.responses', { count: entriesByCategory[category].length })}
                </p>
              </div>

              {entriesByCategory[category].length === 0 ? (
                <div className="text-slate-500 text-sm p-4 text-center border border-dashed border-slate-700 rounded-lg">
                  {t('dashboard.noFeedback')}
                </div>
              ) : (
                entriesByCategory[category].map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4"
                  >
                    <p className="text-slate-200 whitespace-pre-wrap">{entry.content}</p>
                    <p className="text-slate-500 text-xs mt-2">
                      {new Date(entry.created_at).toLocaleString(locale === 'it' ? 'it-IT' : 'en-US')}
                    </p>
                    <VoteButtons 
                      entryId={entry.id} 
                      initialVotes={getVotesForEntry(entry.id)}
                    />
                  </div>
                ))
              )}
            </div>
          ))}
        </div>

        {/* Refresh hint */}
        <p className="text-center text-slate-500 text-sm mt-8">
          {t('dashboard.autoRefresh')}
        </p>
      </div>
    </div>
  )
}
