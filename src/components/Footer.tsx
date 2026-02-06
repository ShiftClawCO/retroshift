import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function Footer({ className }: { className?: string }) {
  const t = useTranslations('footer')

  return (
    <footer className={`py-8 text-muted-foreground text-sm border-t ${className ?? ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p>
            {t('madeWith')}{' '}
            <a
              href="https://shiftclaw.com"
              className="text-foreground hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Shiftclaw
            </a>
          </p>
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              {t('terms')}
            </Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">
              {t('blog')}
            </Link>
            <a
              href="mailto:support@shiftclaw.com"
              className="hover:text-foreground transition-colors"
            >
              {t('contact')}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
