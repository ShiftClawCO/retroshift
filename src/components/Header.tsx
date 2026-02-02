'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { ThemeToggle } from './theme-toggle'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const locale = useLocale()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl">🔄</span>
          <span className="font-bold">RetroShift</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
