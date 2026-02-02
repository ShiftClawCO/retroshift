'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Retro, Entry, FORMATS, FormatKey } from '@/lib/supabase'

export default function DashboardPage() {
  const params = useParams()
  const code = params.code as string
  
  const [retro, setRetro] = useState<Retro | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const loadData = useCallback(async () => {
    // Load retro
    const { data: retroData, error: retroError } = await supabase
      .from('retros')
      .select('*')
      .eq('access_code', code)
      .single()

    if (retroError || !retroData) {
      setError('Retro non trovata')
      setLoading(false)
      return
    }

    setRetro(retroData)

    // Load entries
    const { data: entriesData } = await supabase
      .from('entries')
      .select('*')
      .eq('retro_id', retroData.id)
      .order('created_at', { ascending: true })

    setEntries(entriesData || [])
    setLoading(false)
  }, [code])

  useEffect(() => {
    loadData()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('entries-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'entries',
        },
        (payload) => {
          if (payload.new && retro && payload.new.retro_id === retro.id) {
            setEntries(prev => [...prev, payload.new as Entry])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadData, retro?.id])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-slate-400">Caricamento...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <Link href="/" className="text-emerald-400 hover:text-emerald-300">
            Torna alla home
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
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Link href="/" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
              ← Torna alla home
            </Link>
            <h1 className="text-2xl font-bold text-white">{retro!.title}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {entries.length} feedback ricevuti • {format.name}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyShareLink}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {copied ? '✓ Copiato!' : '🔗 Copia link per il team'}
            </button>
            <button
              onClick={toggleClose}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                retro!.is_closed
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {retro!.is_closed ? '🔓 Riapri' : '🔒 Chiudi retro'}
            </button>
          </div>
        </div>

        {/* Share banner */}
        {entries.length === 0 && (
          <div className="bg-emerald-900/30 border border-emerald-600 rounded-lg p-6 mb-8">
            <h3 className="text-emerald-400 font-semibold mb-2">👋 Condividi con il team</h3>
            <p className="text-slate-300 text-sm mb-4">
              Copia questo link e condividilo su Slack, Teams, o email. Il team può rispondere in modo anonimo.
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
                {copied ? '✓ Copiato!' : 'Copia'}
              </button>
            </div>
          </div>
        )}

        {/* Closed banner */}
        {retro!.is_closed && (
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 mb-8 flex items-center justify-between">
            <span className="text-slate-300">🔒 Questa retro è chiusa. Il team non può più aggiungere feedback.</span>
          </div>
        )}

        {/* Entries grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {format.categories.map((category) => (
            <div key={category} className="space-y-4">
              <div className={`p-4 rounded-lg border ${format.colors[category as keyof typeof format.colors]}`}>
                <h2 className="text-lg font-semibold text-slate-800">
                  {format.labels[category as keyof typeof format.labels]}
                </h2>
                <p className="text-slate-600 text-sm">
                  {entriesByCategory[category].length} risposte
                </p>
              </div>

              {entriesByCategory[category].length === 0 ? (
                <div className="text-slate-500 text-sm p-4 text-center border border-dashed border-slate-700 rounded-lg">
                  Nessun feedback ancora
                </div>
              ) : (
                entriesByCategory[category].map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4"
                  >
                    <p className="text-slate-200 whitespace-pre-wrap">{entry.content}</p>
                    <p className="text-slate-500 text-xs mt-2">
                      {new Date(entry.created_at).toLocaleString('it-IT')}
                    </p>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>

        {/* Refresh hint */}
        <p className="text-center text-slate-500 text-sm mt-8">
          I nuovi feedback appariranno automaticamente 🔄
        </p>
      </div>
    </div>
  )
}
