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
          <h1 className="text-5xl font-bold text-white mb-6">
            🔄 {t('home.title')}
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {t('home.subtitle')}
            <br />
            <span className="text-slate-400">{t('home.subtitleHighlight')}</span>
          </p>
          
          <Link
            href="/create"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
          >
            {t('home.cta')}
          </Link>
          
          <p className="text-slate-500 mt-4 text-sm">
            {t('home.free')}
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-12">{t('home.howItWorks')}</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">1️⃣</div>
            <h3 className="text-lg font-semibold text-white mb-2">{t('home.step1Title')}</h3>
            <p className="text-slate-400">{t('home.step1Desc')}</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">2️⃣</div>
            <h3 className="text-lg font-semibold text-white mb-2">{t('home.step2Title')}</h3>
            <p className="text-slate-400">{t('home.step2Desc')}</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">3️⃣</div>
            <h3 className="text-lg font-semibold text-white mb-2">{t('home.step3Title')}</h3>
            <p className="text-slate-400">{t('home.step3Desc')}</p>
          </div>
        </div>
      </div>

      {/* Formats */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-12">{t('home.formats')}</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-3">{t('formats.start-stop-continue.name')}</h3>
            <div className="space-y-2 text-sm">
              <div className="text-green-400">{t('formats.start-stop-continue.start')}</div>
              <div className="text-red-400">{t('formats.start-stop-continue.stop')}</div>
              <div className="text-blue-400">{t('formats.start-stop-continue.continue')}</div>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-3">{t('formats.mad-sad-glad.name')}</h3>
            <div className="space-y-2 text-sm">
              <div className="text-red-400">{t('formats.mad-sad-glad.mad')}</div>
              <div className="text-blue-400">{t('formats.mad-sad-glad.sad')}</div>
              <div className="text-green-400">{t('formats.mad-sad-glad.glad')}</div>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-3">{t('formats.liked-learned-lacked.name')}</h3>
            <div className="space-y-2 text-sm">
              <div className="text-pink-400">{t('formats.liked-learned-lacked.liked')}</div>
              <div className="text-yellow-400">{t('formats.liked-learned-lacked.learned')}</div>
              <div className="text-gray-400">{t('formats.liked-learned-lacked.lacked')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
        <p>{t('home.footer')} <a href="https://shiftclaw.com" className="text-slate-400 hover:text-white">Shiftclaw</a></p>
      </footer>
    </div>
  )
}
