'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { FORMATS, FormatKey } from '@/lib/types'
import { getCategoryConfig } from '@/lib/category-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Header from '@/components/Header'
import KeyboardHints from '@/components/KeyboardHints'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Crown } from 'lucide-react'

// Generate unique default title
function generateDefaultTitle(): string {
  const now = new Date()
  const day = now.getDate()
  const month = now.toLocaleString('en', { month: 'short' })
  const year = now.getFullYear()
  const id = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `Retro ${day} ${month} ${year} #${id}`
}

const FREE_RETRO_LIMIT = 3

export default function CreateRetro() {
  const router = useRouter()
  const t = useTranslations()
  const [title, setTitle] = useState(generateDefaultTitle)
  const [format, setFormat] = useState<FormatKey>('start-stop-continue')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  // Convex queries & mutations
  const user = useQuery(api.users.getCurrent)
  const retroCount = useQuery(api.retros.countByUser) ?? 0
  const createRetro = useMutation(api.retros.create)

  const checkingLimit = user === undefined
  const isPro = user?.plan === 'pro'
  const limitReached = !isPro && retroCount >= FREE_RETRO_LIMIT

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'Enter', meta: true, action: () => formRef.current?.requestSubmit(), description: 'Create retro' },
  ])

  const keyboardHints = [
    { keys: ['cmd', 'enter'], description: 'Create retro' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError(t('create.errorTitle'))
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await createRetro({
        title: title.trim(),
        format,
      })

      // Redirect to the dashboard with the access code
      router.push(`/dashboard/${result.accessCode}`)
    } catch (err: any) {
      const errorMessage = err?.message || ''
      
      if (errorMessage === 'RETRO_LIMIT_REACHED') {
        setError(t('create.limitReached', { count: FREE_RETRO_LIMIT }))
      } else if (errorMessage === 'Not authenticated') {
        router.push('/login')
      } else {
        setError(t('create.errorGeneric'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <Link href="/" className="text-muted-foreground hover:text-foreground mb-8 inline-block text-sm">
            ← {t('common.backHome')}
          </Link>

          {/* Limit reached banner */}
          {limitReached && (
            <Alert className="mb-6 border-amber-500 bg-amber-500/10">
              <Crown className="h-4 w-4 text-amber-500" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {t('create.limitReached', { count: FREE_RETRO_LIMIT })}
                </span>
                <Button asChild size="sm" className="ml-4">
                  <Link href="/pricing">{t('create.upgradeToPro')}</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t('create.title')}</CardTitle>
              {!isPro && !limitReached && (
                <p className="text-sm text-muted-foreground">
                  {t('create.retroCount', { current: retroCount, max: FREE_RETRO_LIMIT })}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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

                <Button 
                  type="submit" 
                  disabled={loading || checkingLimit || limitReached} 
                  className="w-full"
                >
                  {checkingLimit ? t('common.loading') : loading ? t('create.submitting') : t('create.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <KeyboardHints hints={keyboardHints} />
    </div>
  )
}
