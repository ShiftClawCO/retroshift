'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Home() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher currentLocale={locale} />
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {t('home.heroTitle')}
          </h1>
          <p className="text-xl text-slate-400 mb-4 max-w-2xl mx-auto">
            {t('home.heroSubtitle')}
          </p>
          <p className="text-lg text-emerald-400 mb-8 max-w-2xl mx-auto font-medium">
            {t('home.heroSolution')}
          </p>
          
          <Link
            href="/create"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg shadow-emerald-500/25"
          >
            {t('home.cta')}
          </Link>
          
          <p className="text-slate-500 mt-4 text-sm">
            {t('home.ctaSub')}
          </p>
        </div>
      </div>

      {/* Pain Points */}
      <div className="bg-slate-800/50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-12">{t('home.painTitle')}</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">{t('home.pain1Title').split(' ')[0]}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.pain1Title').substring(3)}</h3>
              <p className="text-slate-400 italic">{t('home.pain1Desc')}</p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-4xl mb-4">{t('home.pain2Title').split(' ')[0]}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.pain2Title').substring(3)}</h3>
              <p className="text-slate-400 italic">{t('home.pain2Desc')}</p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-4xl mb-4">{t('home.pain3Title').split(' ')[0]}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.pain3Title').substring(3)}</h3>
              <p className="text-slate-400 italic">{t('home.pain3Desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Solution */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-12">{t('home.solutionTitle')}</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">{t('home.solution1Title').split(' ')[0]}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.solution1Title').substring(3)}</h3>
              <p className="text-slate-400">{t('home.solution1Desc')}</p>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">{t('home.solution2Title').split(' ')[0]}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.solution2Title').substring(3)}</h3>
              <p className="text-slate-400">{t('home.solution2Desc')}</p>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">{t('home.solution3Title').split(' ')[0]}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.solution3Title').substring(3)}</h3>
              <p className="text-slate-400">{t('home.solution3Desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-slate-800/50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-12">{t('home.howItWorks')}</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.step1Title').substring(3)}</h3>
              <p className="text-slate-400">{t('home.step1Desc')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.step2Title').substring(3)}</h3>
              <p className="text-slate-400">{t('home.step2Desc')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.step3Title').substring(3)}</h3>
              <p className="text-slate-400">{t('home.step3Desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-4">{t('home.comparisonTitle')}</h2>
          <p className="text-slate-400 text-center mb-8">{t('home.comparisonIntro')}</p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-lg">
              <span className="text-red-400 text-xl">✗</span>
              <p className="text-slate-300">{t('home.comp1')}</p>
            </div>
            <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-lg">
              <span className="text-red-400 text-xl">✗</span>
              <p className="text-slate-300">{t('home.comp2')}</p>
            </div>
            <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-lg">
              <span className="text-red-400 text-xl">✗</span>
              <p className="text-slate-300">{t('home.comp3')}</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-emerald-900/30 border border-emerald-600 rounded-lg">
            <p className="text-emerald-400 text-center font-medium">✓ {t('home.comparisonConclusion')}</p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-slate-800/50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-12">{t('home.pricingTitle')}</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-2">{t('home.pricingFreeTitle')}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{t('home.pricingFreePrice')}</span>
                <span className="text-slate-400 ml-2">{t('home.pricingFreePeriod')}</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span> {t('home.pricingFree1')}
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span> {t('home.pricingFree2')}
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span> {t('home.pricingFree3')}
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span> {t('home.pricingFree4')}
                </li>
              </ul>
              <Link
                href="/create"
                className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                {t('home.cta')}
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-slate-800 rounded-lg p-8 border border-emerald-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                {t('home.pricingProCta')}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('home.pricingProTitle')}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{t('home.pricingProPrice')}</span>
                <span className="text-slate-400 ml-1">{t('home.pricingProPeriod')}</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span> {t('home.pricingPro1')}
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span> {t('home.pricingPro2')}
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span> {t('home.pricingPro3')}
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span> {t('home.pricingPro4')}
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span> {t('home.pricingPro5')}
                </li>
              </ul>
              <button
                disabled
                className="block w-full text-center bg-slate-700 text-slate-400 font-semibold px-6 py-3 rounded-lg cursor-not-allowed"
              >
                {t('home.pricingProCta')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-12">{t('home.faqTitle')}</h2>
          
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.faq1Q')}</h3>
              <p className="text-slate-400">{t('home.faq1A')}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.faq2Q')}</h3>
              <p className="text-slate-400">{t('home.faq2A')}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.faq3Q')}</h3>
              <p className="text-slate-400">{t('home.faq3A')}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.faq4Q')}</h3>
              <p className="text-slate-400">{t('home.faq4A')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-emerald-900/30 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">{t('home.finalCta')}</h2>
          <Link
            href="/create"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg shadow-emerald-500/25"
          >
            {t('home.finalCtaButton')}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
        <p>{t('home.footer')} <a href="https://shiftclaw.com" className="text-slate-400 hover:text-white">Shiftclaw</a></p>
      </footer>
    </div>
  )
}
