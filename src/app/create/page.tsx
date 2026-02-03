'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { FORMATS, FormatKey } from '@/lib/supabase'
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
  const [limitReached, setLimitReached] = useState(false)
  const [retroCount, setRetroCount] = useState(0)
  const [isPro, setIsPro] = useState(false)
  const [checkingLimit, setCheckingLimit] = useState(true)
  const formRef = useRef<HTMLFormElement>(null)

  // Check subscription and retro count on mount
  useEffect(() => {
    const checkLimits = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setCheckingLimit(false)
        return
      }

      // Check if user has pro subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .in('status', ['active', 'past_due'])
        .single()

      if (subscription) {
        setIsPro(true)
        setCheckingLimit(false)
        return
      }

      // Count user's retros (only open ones count against limit)
      const { count } = await supabase
        .from('retros')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_closed', false)

      const currentCount = count || 0
      setRetroCount(currentCount)
      setLimitReached(currentCount >= FREE_RETRO_LIMIT)
      setCheckingLimit(false)
    }

    checkLimits()
  }, [])

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

    const supabase = createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error: dbError } = await supabase
      .from('retros')
      .insert({
        title: title.trim(),
        format,
        user_id: user?.id || null,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Create retro error:', dbError)
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

          {/* Limit reached banner */}
          {limitReached && !isPro && (
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
                  disabled={loading || checkingLimit || (limitReached && !isPro)} 
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
