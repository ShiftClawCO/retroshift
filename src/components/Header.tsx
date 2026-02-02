'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { ThemeToggle } from './theme-toggle'
import LanguageSwitcher from './LanguageSwitcher'
import { RotateCcw } from 'lucide-react'

export default function Header() {
  const locale = useLocale()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <RotateCcw className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-lg">RetroShift</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
