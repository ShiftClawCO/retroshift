'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/client'
import { getCheckoutUrl } from '@/lib/lemonsqueezy'
import { Check, Sparkles, Zap, Crown, Loader2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

// LemonSqueezy Product Variant ID for Pro plan (€9/month)
// This will be set once product is created in LemonSqueezy dashboard
const PRO_VARIANT_ID = process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID || ''

export default function PricingPage() {
  const t = useTranslations()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro'>('free')

  useEffect(() => {
    const supabase = createClient()
    
    // Get user and subscription status
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Check subscription status
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan, status')
          .eq('user_id', user.id)
          .in('status', ['active', 'past_due'])
          .single()
        
        if (subscription) {
          setCurrentPlan(subscription.plan as 'free' | 'pro')
        }
      }
      
      setLoading(false)
    }
    
    init()
  }, [])

  const handleUpgrade = () => {
    if (!user) {
      // Redirect to login with return URL
      window.location.href = '/login?redirect=/pricing'
      return
    }
    
    if (!PRO_VARIANT_ID) {
      alert('Checkout not yet configured. Coming soon!')
      return
    }
    
    setCheckoutLoading(true)
    
    // Generate checkout URL and open LemonSqueezy overlay
    const checkoutUrl = getCheckoutUrl({
      variantId: PRO_VARIANT_ID,
      userId: user.id,
      email: user.email,
      redirectUrl: `${window.location.origin}/pricing?success=true`,
    })
    
    // Load LemonSqueezy.js and open overlay
    if (typeof window !== 'undefined') {
      // @ts-expect-error - LemonSqueezy is loaded via script
      if (window.createLemonSqueezy) {
        // @ts-expect-error
        window.createLemonSqueezy()
      }
      
      // @ts-expect-error - LemonSqueezy global
      if (window.LemonSqueezy) {
        // @ts-expect-error
        window.LemonSqueezy.Url.Open(checkoutUrl)
      } else {
        // Fallback to redirect
        window.location.href = checkoutUrl
      }
    }
    
    setCheckoutLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* LemonSqueezy.js for checkout overlay */}
      <script src="https://app.lemonsqueezy.com/js/lemon.js" defer />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {t('pricing.badge')}
          </Badge>
          
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {t('pricing.title')}
          </h1>
          
          <p className="text-xl text-muted-foreground">
            {t('pricing.subtitle')}
          </p>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Free Plan */}
          <Card className={currentPlan === 'free' ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-muted-foreground" />
                  {t('pricing.freeName')}
                </CardTitle>
                {currentPlan === 'free' && (
                  <Badge variant="outline">{t('pricing.currentPlan')}</Badge>
                )}
              </div>
              <CardDescription>{t('pricing.freeDesc')}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">€0</span>
                <span className="text-muted-foreground ml-2">{t('pricing.forever')}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{t('pricing.free1')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{t('pricing.free2')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{t('pricing.free3')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{t('pricing.free4')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{t('pricing.free5')}</span>
                </li>
              </ul>
              
              {currentPlan === 'free' ? (
                <Button asChild className="w-full">
                  <Link href="/create">{t('pricing.freeCta')}</Link>
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  {t('pricing.freeCta')}
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Pro Plan */}
          <Card className={`relative ${currentPlan === 'pro' ? 'border-primary' : 'border-primary/50'}`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="gap-1">
                <Crown className="w-3 h-3" />
                {t('pricing.popular')}
              </Badge>
            </div>
            
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  {t('pricing.proName')}
                </CardTitle>
                {currentPlan === 'pro' && (
                  <Badge variant="outline">{t('pricing.currentPlan')}</Badge>
                )}
              </div>
              <CardDescription>{t('pricing.proDesc')}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">€9</span>
                <span className="text-muted-foreground ml-1">{t('pricing.perMonth')}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{t('pricing.pro1')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{t('pricing.pro2')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{t('pricing.pro3')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{t('pricing.pro4')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{t('pricing.pro5')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{t('pricing.pro6')}</span>
                </li>
              </ul>
              
              {currentPlan === 'pro' ? (
                <Button variant="outline" className="w-full" disabled>
                  {t('pricing.currentPlan')}
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleUpgrade}
                  disabled={loading || checkoutLoading}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('pricing.processing')}
                    </>
                  ) : (
                    t('pricing.proCta')
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">{t('pricing.faqTitle')}</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('pricing.faq1Q')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t('pricing.faq1A')}</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('pricing.faq2Q')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t('pricing.faq2A')}</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('pricing.faq3Q')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t('pricing.faq3A')}</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('pricing.faq4Q')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t('pricing.faq4A')}</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Money-back guarantee */}
        <div className="text-center mt-12 text-muted-foreground">
          <p>{t('pricing.guarantee')}</p>
        </div>
      </main>
    </div>
  )
}
