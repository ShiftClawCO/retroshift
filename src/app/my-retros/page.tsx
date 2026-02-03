'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/Header'
import { Plus, ExternalLink, Lock, Unlock, ChevronDown } from 'lucide-react'
import type { Retro } from '@/lib/supabase'

const PAGE_SIZE = 20

export default function MyRetrosPage() {
  const t = useTranslations()
  const [retros, setRetros] = useState<Retro[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(0)

  const fetchRetros = async (pageNum: number, append = false) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setLoading(false)
      return
    }

    const from = pageNum * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error, count } = await supabase
      .from('retros')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (!error && data) {
      if (append) {
        setRetros(prev => [...prev, ...data])
      } else {
        setRetros(data)
      }
      setHasMore((count || 0) > (pageNum + 1) * PAGE_SIZE)
    }
    setLoading(false)
    setLoadingMore(false)
  }

  useEffect(() => {
    fetchRetros(0)
  }, [])

  const loadMore = () => {
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    fetchRetros(nextPage, true)
  }

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

              {/* Load more button */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="gap-2"
                  >
                    {loadingMore ? (
                      t('common.loading')
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        {t('auth.loadMore')}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
