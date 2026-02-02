'use client'

import { useTransition } from 'react'

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const [isPending, startTransition] = useTransition()

  const switchLocale = (locale: string) => {
    startTransition(() => {
      document.cookie = `locale=${locale};path=/;max-age=31536000`
      window.location.reload()
    })
  }

  return (
    <div className="flex gap-2 text-sm">
      <button
        onClick={() => switchLocale('it')}
        disabled={isPending}
        className={`px-2 py-1 rounded transition-colors ${
          currentLocale === 'it' 
            ? 'bg-slate-700 text-white' 
            : 'text-slate-400 hover:text-white'
        }`}
      >
        IT
      </button>
      <button
        onClick={() => switchLocale('en')}
        disabled={isPending}
        className={`px-2 py-1 rounded transition-colors ${
          currentLocale === 'en' 
            ? 'bg-slate-700 text-white' 
            : 'text-slate-400 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  )
}
