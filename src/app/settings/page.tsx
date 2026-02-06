'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import Header from '@/components/Header'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  User,
  CreditCard,
  Crown,
  Calendar,
  ExternalLink,
  AlertTriangle,
  Check,
} from 'lucide-react'

export default function SettingsPage() {
  const t = useTranslations()
  const { user: workosUser } = useAuth()
  const [isCanceling, setIsCanceling] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const convexUser = useQuery(
    api.users.getByWorkosId,
    workosUser ? { workosId: workosUser.id } : 'skip'
  )

  const subscription = useQuery(
    api.subscriptions.getCurrent,
    workosUser ? {} : 'skip'
  )

  const isLoading = convexUser === undefined || subscription === undefined
  const isPro = convexUser?.plan === 'pro'
  const hasActiveSubscription =
    subscription && subscription.status === 'active'

  // Check if subscription is set to cancel at period end
  const isCancelingAtPeriodEnd =
    hasActiveSubscription && subscription.cancelAtPeriodEnd === true

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleCancelSubscription = async () => {
    setIsCanceling(true)

    try {
      const response = await fetch('/api/stripe/cancel', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      toast.success(t('settings.cancelSuccess'), {
        description: t('settings.cancelSuccessDesc', {
          date: formatDate(data.cancelAt),
        }),
      })

      setCancelDialogOpen(false)

      // Reload to reflect changes
      window.location.reload()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to cancel subscription'
      toast.error(t('settings.cancelError'), {
        description: message,
      })
    } finally {
      setIsCanceling(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      window.location.href = data.url
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to open billing portal'
      toast.error(message)
    }
  }

  // If not logged in, redirect to login
  if (!workosUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">
              {t('settings.signInRequired')}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t('settings.signInRequiredDesc')}
            </p>
            <Button asChild size="lg">
              <Link href="/login">{t('auth.login')}</Link>
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t('settings.title')}</h1>

          {/* Profile Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('settings.profile')}
              </CardTitle>
              <CardDescription>{t('settings.profileDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {workosUser.profilePictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={workosUser.profilePictureUrl}
                    alt={workosUser.firstName || 'Profile'}
                    width={64}
                    height={64}
                    className="rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-lg">
                    {workosUser.firstName} {workosUser.lastName}
                  </p>
                  <p className="text-muted-foreground">{workosUser.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {t('settings.subscription')}
              </CardTitle>
              <CardDescription>
                {t('settings.subscriptionDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-10 w-32" />
                </div>
              ) : (
                <>
                  {/* Current Plan */}
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-3">
                      {isPro ? (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Crown className="w-5 h-5 text-primary" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {isPro
                              ? t('settings.proPlan')
                              : t('settings.freePlan')}
                          </p>
                          <Badge variant={isPro ? 'default' : 'secondary'}>
                            {t('settings.currentPlan')}
                          </Badge>
                        </div>
                        {hasActiveSubscription && subscription.currentPeriodEnd && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {isCancelingAtPeriodEnd
                              ? t('settings.cancelsOn', {
                                  date: formatDate(subscription.currentPeriodEnd),
                                })
                              : t('settings.renewsOn', {
                                  date: formatDate(subscription.currentPeriodEnd),
                                })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pro Features List */}
                  {isPro && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {t('settings.proFeatures')}
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1.5">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          {t('pricing.pro1')}
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          {t('pricing.pro2')}
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          {t('pricing.pro3')}
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          {t('pricing.pro4')}
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          {t('pricing.pro5')}
                        </li>
                      </ul>
                    </div>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="space-y-3">
                    {isPro && hasActiveSubscription ? (
                      <>
                        {/* Manage Subscription via Stripe Portal */}
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={handleManageSubscription}
                        >
                          <span className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            {t('settings.managePayment')}
                          </span>
                          <ExternalLink className="w-4 h-4" />
                        </Button>

                        {/* Cancel Subscription */}
                        <AlertDialog
                          open={cancelDialogOpen}
                          onOpenChange={setCancelDialogOpen}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {t('settings.cancelSubscription')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                {t('settings.cancelDialogTitle')}
                              </AlertDialogTitle>
                              <AlertDialogDescription className="space-y-3">
                                <p>{t('settings.cancelDialogDesc')}</p>
                                <ul className="text-sm space-y-2 mt-4">
                                  <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>
                                      {t('settings.cancelDialogPoint1')}
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>
                                      {t('settings.cancelDialogPoint2')}
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>
                                      {t('settings.cancelDialogPoint3')}
                                    </span>
                                  </li>
                                </ul>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t('settings.keepSubscription')}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleCancelSubscription}
                                disabled={isCanceling}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {isCanceling
                                  ? t('settings.canceling')
                                  : t('settings.confirmCancel')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : (
                      <Button asChild className="w-full">
                        <Link href="/pricing">
                          <Crown className="w-4 h-4 mr-2" />
                          {t('settings.upgradeToPro')}
                        </Link>
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
