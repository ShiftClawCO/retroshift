import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getBlogPost, getAllBlogSlugs } from '@/lib/blog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, Clock, Zap } from 'lucide-react'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    return { title: 'Post not found | RetroShift' }
  }

  return {
    title: `${post.title} | RetroShift Blog`,
    description: post.description,
  }
}

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function markdownToHtml(markdown: string): string {
  // Simple markdown to HTML converter
  // Note: For production, consider using a proper markdown library
  let html = markdown

  // Headers (must come before paragraph processing)
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h2 class="text-3xl font-bold mt-10 mb-6">$1</h2>')

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-8 border-border" />')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-6 list-disc">$1</li>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal">$1</li>')

  // Wrap consecutive list items
  html = html.replace(/(<li[^>]*>.*<\/li>\n)+/g, (match) => {
    if (match.includes('list-disc')) {
      return `<ul class="space-y-2 my-4">${match}</ul>`
    }
    return `<ol class="space-y-2 my-4">${match}</ol>`
  })

  // Paragraphs - split by double newlines and wrap non-tagged content
  const blocks = html.split(/\n\n+/)
  html = blocks
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      // Skip if already wrapped in a tag
      if (trimmed.startsWith('<')) return trimmed
      return `<p class="text-muted-foreground leading-relaxed mb-4">${trimmed}</p>`
    })
    .join('\n')

  return html
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const t = await getTranslations('blog')
  const post = getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const readTime = estimateReadTime(post.content)
  const htmlContent = markdownToHtml(post.content)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Zap className="w-6 h-6 text-primary" />
            RetroShift
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/create">Try Free</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <article className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToBlog')}
          </Link>

          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

            <p className="text-xl text-muted-foreground mb-6">{post.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-6">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.date, 'en')}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('readTime', { minutes: readTime })}
              </span>
            </div>
          </header>

          {/* Content */}
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* CTA */}
          <div className="mt-16 p-8 bg-primary/10 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to try async retrospectives?</h2>
            <p className="text-muted-foreground mb-6">
              Set up your first retro in 30 seconds. Free to start, no credit card required.
            </p>
            <Button asChild size="lg">
              <Link href="/create">Create a Free Retro</Link>
            </Button>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground text-sm border-t mt-16">
        <div className="container mx-auto px-4">
          <p>
            Made with 🦞 by{' '}
            <a href="https://shiftclaw.com" className="text-foreground hover:underline">
              Shiftclaw
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
