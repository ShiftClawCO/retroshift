'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { supabase, FORMATS, FormatKey } from '@/lib/supabase'
import { getCategoryConfig } from '@/lib/category-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Header from '@/components/Header'

// Generate unique default title
function generateDefaultTitle(): string {
  const now = new Date()
  const day = now.getDate()
  const month = now.toLocaleString('en', { month: 'short' })
  const year = now.getFullYear()
  const id = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `Retro ${day} ${month} ${year} #${id}`
}

export default function CreateRetro() {
  const router = useRouter()
  const t = useTranslations()
  const [title, setTitle] = useState(generateDefaultTitle)
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <Link href="/" className="text-muted-foreground hover:text-foreground mb-8 inline-block text-sm">
            ← {t('common.backHome')}
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>{t('create.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    {t('create.titleLabel')}
                  </label>
                  <Input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('create.titlePlaceholder')}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {t('create.formatLabel')}
                  </label>
                  <div className="space-y-3">
                    {(Object.keys(FORMATS) as FormatKey[]).map((key) => (
                      <div
                        key={key}
                        onClick={() => setFormat(key)}
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                          format === key
                            ? 'bg-primary/10 border-primary shadow-sm'
                            : 'bg-card hover:border-primary/50 hover:shadow-sm'
                        }`}
                      >
                        <div className="w-full">
                          <div className="font-medium">{t(`formats.${key}.name`)}</div>
                          <div className="flex items-center gap-4 mt-2">
                            {FORMATS[key].categories.map((cat) => {
                              const config = getCategoryConfig(cat)
                              const IconComponent = config.icon
                              return (
                                <div key={cat} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
                                  <span>{t(`formats.${key}.${cat}`)}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="text-destructive text-sm">{error}</div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? t('create.submitting') : t('create.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
