'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  Rocket,
  VolumeX,
  Users,
  Theater,
  Lock,
  Clock,
  BarChart3,
  X,
  Check,
  Crown,
  Zap,
} from 'lucide-react'

export default function Home() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Rocket className="w-3.5 h-3.5" />
            Free & Open Source
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {t('home.heroTitle')}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-4">
            {t('home.heroSubtitle')}
          </p>
          
          <p className="text-lg text-primary font-medium mb-8">
            {t('home.heroSolution')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/create">{t('home.cta')}</Link>
            </Button>
          </div>
          
          <p className="text-muted-foreground mt-4 text-sm">
            {t('home.ctaSub')}
          </p>
        </div>
      </section>

      {/* Pain Points */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">{t('home.painTitle')}</h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                  <VolumeX className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">{t('home.pain1Title').replace(/^[^\s]+\s/, '')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="italic">{t('home.pain1Desc')}</CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">{t('home.pain2Title').replace(/^[^\s]+\s/, '')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="italic">{t('home.pain2Desc')}</CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                  <Theater className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">{t('home.pain3Title').replace(/^[^\s]+\s/, '')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="italic">{t('home.pain3Desc')}</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">{t('home.solutionTitle')}</h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="w-10 h-10 mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>{t('home.solution1Title').replace(/^[^\s]+\s/, '')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t('home.solution1Desc')}</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-10 h-10 mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>{t('home.solution2Title').replace(/^[^\s]+\s/, '')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t('home.solution2Desc')}</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-10 h-10 mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>{t('home.solution3Title').replace(/^[^\s]+\s/, '')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t('home.solution3Desc')}</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">{t('home.howItWorks')}</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
              <h3 className="font-semibold mb-2">{t('home.step1Title').replace(/^\d+\.\s*/, '')}</h3>
              <p className="text-muted-foreground text-sm">{t('home.step1Desc')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
              <h3 className="font-semibold mb-2">{t('home.step2Title').replace(/^\d+\.\s*/, '')}</h3>
              <p className="text-muted-foreground text-sm">{t('home.step2Desc')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
              <h3 className="font-semibold mb-2">{t('home.step3Title').replace(/^\d+\.\s*/, '')}</h3>
              <p className="text-muted-foreground text-sm">{t('home.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-4">{t('home.comparisonTitle')}</h2>
            <p className="text-muted-foreground text-center mb-8">{t('home.comparisonIntro')}</p>
            
            <div className="space-y-4">
              <Card className="border-destructive/50">
                <CardContent className="flex items-start gap-3 pt-4">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p>{t('home.comp1')}</p>
                </CardContent>
              </Card>
              <Card className="border-destructive/50">
                <CardContent className="flex items-start gap-3 pt-4">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p>{t('home.comp2')}</p>
                </CardContent>
              </Card>
              <Card className="border-destructive/50">
                <CardContent className="flex items-start gap-3 pt-4">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p>{t('home.comp3')}</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mt-6 border-primary bg-primary/5">
              <CardContent className="flex items-center justify-center gap-2 pt-4">
                <Check className="w-5 h-5 text-primary" />
                <p className="text-primary font-medium">{t('home.comparisonConclusion')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">{t('home.pricingTitle')}</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* Free */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-muted-foreground" />
                  {t('home.pricingFreeTitle')}
                </CardTitle>
                <CardDescription>{t('home.pricingFreeDesc')}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">€0</span>
                  <span className="text-muted-foreground ml-2">{t('home.pricingFreePeriod')}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t('home.pricingFree1')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t('home.pricingFree2')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t('home.pricingFree3')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t('home.pricingFree4')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t('home.pricingFree5')}</li>
                </ul>
                <Button asChild className="w-full mt-6">
                  <Link href="/create">{t('home.pricingFreeCta')}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-primary/50 relative flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gap-1">
                  <Crown className="w-3 h-3" />
                  {t('home.pricingPopular')}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  {t('home.pricingProTitle')}
                </CardTitle>
                <CardDescription>{t('home.pricingProDesc')}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">€9</span>
                  <span className="text-muted-foreground ml-1">{t('home.pricingProPeriod')}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t('home.pricingPro1')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t('home.pricingPro2')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t('home.pricingPro3')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t('home.pricingPro4')}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t('home.pricingPro5')}</li>
                </ul>
                <Button asChild className="w-full mt-6">
                  <Link href="/pricing">{t('home.pricingProCta')}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">{t('home.faqTitle')}</h2>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('home.faq1Q')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{t('home.faq1A')}</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('home.faq2Q')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{t('home.faq2A')}</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('home.faq3Q')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{t('home.faq3A')}</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('home.faq4Q')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{t('home.faq4A')}</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">{t('home.finalCta')}</h2>
          <Button asChild size="lg" className="text-lg">
            <Link href="/create">{t('home.finalCtaButton')}</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
