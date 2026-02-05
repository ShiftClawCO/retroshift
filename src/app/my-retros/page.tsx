'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/Header'
import { Plus, ExternalLink, Lock, Unlock } from 'lucide-react'

export default function MyRetrosPage() {
  const t = useTranslations()
  const retros = useQuery(api.retros.list)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const loading = retros === undefined

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">{t('auth.myRetros')}</h1>
            <Button asChild size="icon" className="h-10 w-10 rounded-full">
              <Link href="/create">
                <Plus className="w-5 h-5" strokeWidth={3} />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('common.loading')}
            </div>
          ) : retros.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {t('auth.noRetrosYet')}
            </div>
          ) : (
            <div className="space-y-4">
              {retros.map((retro) => (
                <Card key={retro._id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{retro.title}</CardTitle>
                        <CardDescription>{formatDate(retro.createdAt)}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {retro.isClosed ? (
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
                        <Link href={`/dashboard/${retro.accessCode}`}>
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
