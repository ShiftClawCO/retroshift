'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { supabase, FORMATS, FormatKey } from '@/lib/supabase'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function CreateRetro() {
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()
  const [title, setTitle] = useState('')
  const [format, setFormat] = useState<FormatKey>('start-stop-continue')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError(t('create.errorTitle'))
      return
    }

    setLoading(true)
    setError('')

    const { data, error: dbError } = await supabase
      .from('retros')
      .insert({
        title: title.trim(),
        format,
      })
      .select()
      .single()

    if (dbError) {
      setError(t('create.errorGeneric'))
      setLoading(false)
      return
    }

    router.push(`/dashboard/${data.access_code}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher currentLocale={locale} />
      </div>

      <div className="max-w-xl mx-auto px-4">
        <Link href="/" className="text-slate-400 hover:text-white mb-8 inline-block">
          ← {t('common.backHome')}
        </Link>

        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h1 className="text-2xl font-bold text-white mb-6">{t('create.title')}</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                {t('create.titleLabel')}
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('create.titlePlaceholder')}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                {t('create.formatLabel')}
              </label>
              <div className="space-y-3">
                {(Object.keys(FORMATS) as FormatKey[]).map((key) => (
                  <label
                    key={key}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                      format === key
                        ? 'bg-emerald-900/30 border-emerald-500'
                        : 'bg-slate-900 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={key}
                      checked={format === key}
                      onChange={() => setFormat(key)}
                      className="sr-only"
                    />
                    <div>
                      <div className="font-medium text-white">{t(`formats.${key}.name`)}</div>
                      <div className="text-sm text-slate-400 mt-1">
                        {FORMATS[key].categories.map((cat) => 
                          t(`formats.${key}.${cat}`)
                        ).join(' • ')}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {loading ? t('create.submitting') : t('create.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
