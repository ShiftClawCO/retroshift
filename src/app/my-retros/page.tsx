'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/Header'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, ExternalLink, Lock, Unlock, FolderOpen } from 'lucide-react'

export default function MyRetrosPage() {
  const t = useTranslations()
  const { user: workosUser } = useAuth()
  
  const retros = useQuery(
    api.retros.listByWorkosId,
    workosUser ? { workosId: workosUser.id } : 'skip'
  )

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const loading = retros === undefined

  // If not logged in, redirect to login
  if (!workosUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Sign in to view your retros</h1>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to view your retrospectives.
            </p>
            <Button asChild size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </main>
      </div>
    )
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
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : retros.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No retrospectives yet</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6">
                {t('auth.noRetrosYet')}
              </p>
              <Button asChild size="lg">
                <Link href="/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first retro
                </Link>
              </Button>
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
                            Closed
                          </Badge>
                        ) : (
                          <Badge variant="default" className="gap-1">
                            <Unlock className="w-3 h-3" />
                            Open
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
                          Open Dashboard
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
