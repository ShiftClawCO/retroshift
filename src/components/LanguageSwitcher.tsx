'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const [isPending, startTransition] = useTransition()

  const switchLocale = (locale: string) => {
    startTransition(() => {
      document.cookie = `locale=${locale};path=/;max-age=31536000`
      window.location.reload()
    })
  }

  return (
    <div className="flex gap-1">
      <Button
        variant={currentLocale === 'it' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => switchLocale('it')}
        disabled={isPending}
        className="h-8 px-2 text-xs"
      >
        IT
      </Button>
      <Button
        variant={currentLocale === 'en' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => switchLocale('en')}
        disabled={isPending}
        className="h-8 px-2 text-xs"
      >
        EN
      </Button>
    </div>
  )
}
