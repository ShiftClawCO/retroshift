'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export default function EmailSignInForm({ signInUrl }: { signInUrl: string }) {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    const url = new URL(signInUrl)
    url.searchParams.set('login_hint', email.trim())
    window.location.href = url.toString()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        type="email"
        placeholder={t('emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit" variant="outline" className="w-full" size="lg">
        <Mail className="w-4 h-4 mr-2" />
        {t('continueWithEmail')}
      </Button>
    </form>
  )
}
