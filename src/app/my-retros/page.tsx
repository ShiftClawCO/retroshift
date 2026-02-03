'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/Header'
import { Plus, ExternalLink, Lock, Unlock } from 'lucide-react'
import type { Retro } from '@/lib/supabase'

export default function MyRetrosPage() {
  const t = useTranslations()
  const [retros, setRetros] = useState<Retro[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRetros = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data, error } = await supabase
        .from('retros')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setRetros(data)
      }
      setLoading(false)
    }

    fetchRetros()
  }, [])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">{t('auth.myRetros')}</h1>
            <Button asChild>
              <Link href="/create">
                <Plus className="w-4 h-4 mr-2" />
                {t('home.cta').replace(' — Free', '')}
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('common.loading')}
            </div>
          ) : retros.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Non hai ancora creato nessuna retro.
                </p>
                <Button asChild>
                  <Link href="/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Crea la tua prima Retro
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {retros.map((retro) => (
                <Card key={retro.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{retro.title}</CardTitle>
                        <CardDescription>{formatDate(retro.created_at)}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {retro.is_closed ? (
                          <Badge variant="secondary" className="gap-1">
                            <Lock className="w-3 h-3" />
                            Chiusa
                          </Badge>
                        ) : (
                          <Badge variant="default" className="gap-1">
                            <Unlock className="w-3 h-3" />
                            Aperta
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{retro.format}</Badge>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/${retro.access_code}`}>
                          Apri Dashboard
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
