'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { supabase, Retro, FORMATS, FormatKey } from '@/lib/supabase'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function ParticipatePage() {
  const params = useParams()
  const code = params.code as string
  const t = useTranslations()
  const locale = useLocale()
  
  const [retro, setRetro] = useState<Retro | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [entries, setEntries] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    loadRetro()
  }, [code])

  const loadRetro = async () => {
    const { data, error: dbError } = await supabase
      .from('retros')
      .select('*')
      .eq('access_code', code)
      .single()

    if (dbError || !data) {
      setError(t('participate.notFound'))
      setLoading(false)
      return
    }

    setRetro(data)
    
    const format = FORMATS[data.format as FormatKey]
    const initialEntries: Record<string, string> = {}
    format.categories.forEach(cat => {
      initialEntries[cat] = ''
    })
    setEntries(initialEntries)
    
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const hasContent = Object.values(entries).some(v => v.trim())
    if (!hasContent) {
      setError(t('participate.errorEmpty'))
      return
    }

    setSubmitting(true)
    setError('')

    const toInsert = Object.entries(entries)
      .filter(([_, content]) => content.trim())
      .map(([category, content]) => ({
        retro_id: retro!.id,
        category,
        content: content.trim()
      }))

    const { error: dbError } = await supabase
      .from('entries')
      .insert(toInsert)

    if (dbError) {
      setError(t('participate.errorGeneric'))
      setSubmitting(false)
      return
    }

    setSubmitted(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-slate-400">{t('common.loading')}</div>
      </div>
    )
  }

  if (error && !retro) {
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

  if (retro?.is_closed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔒</div>
          <div className="text-slate-400 mb-4">{t('participate.closed')}</div>
          <Link href="/" className="text-emerald-400 hover:text-emerald-300">
            {t('participate.createNew')}
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('participate.thanks')}</h1>
          <p className="text-slate-400 mb-6">{t('participate.sent')}</p>
          <button
            onClick={() => {
              setSubmitted(false)
              const format = FORMATS[retro!.format as FormatKey]
              const resetEntries: Record<string, string> = {}
              format.categories.forEach(cat => {
                resetEntries[cat] = ''
              })
              setEntries(resetEntries)
            }}
            className="text-emerald-400 hover:text-emerald-300"
          >
            {t('participate.addMore')}
          </button>
        </div>
      </div>
    )
  }

  const format = FORMATS[retro!.format as FormatKey]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher currentLocale={locale} />
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{retro!.title}</h1>
          <p className="text-slate-400">{t('participate.anonymous')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {format.categories.map((category) => (
            <div 
              key={category}
              className={`p-6 rounded-lg border ${format.colors[category as keyof typeof format.colors]}`}
            >
              <label className="block text-lg font-medium text-slate-800 mb-3">
                {t(`formats.${retro!.format}.${category}`)}
              </label>
              <textarea
                value={entries[category] || ''}
                onChange={(e) => setEntries(prev => ({ ...prev, [category]: e.target.value }))}
                placeholder={t('participate.placeholder')}
                rows={3}
                className="w-full px-4 py-3 bg-white/80 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ))}

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-semibold px-6 py-4 rounded-lg transition-colors text-lg"
          >
            {submitting ? t('participate.submitting') : t('participate.submit')}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-8">
          Powered by <a href="/" className="text-slate-400 hover:text-white">RetroShift</a>
        </p>
      </div>
    </div>
  )
}
