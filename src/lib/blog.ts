import fs from 'fs'
import path from 'path'

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tags: string[]
  content: string
}

export interface BlogPostMeta {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tags: string[]
}

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

function parseFrontmatter(content: string): { meta: Record<string, unknown>; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return { meta: {}, body: content }
  }

  const frontmatter = match[1]
  const body = match[2]

  const meta: Record<string, unknown> = {}

  // Parse YAML-like frontmatter (simplified parser)
  const lines = frontmatter.split('\n')
  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const key = line.slice(0, colonIndex).trim()
    let value: string | string[] = line.slice(colonIndex + 1).trim()

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    // Parse arrays like ["tag1", "tag2"]
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1)
      value = arrayContent.split(',').map(item => {
        const trimmed = item.trim()
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
          return trimmed.slice(1, -1)
        }
        return trimmed
      })
    }

    meta[key] = value
  }

  return { meta, body }
}

export function getAllBlogPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return []
  }

  const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'))

  const posts = files.map(file => {
    const filePath = path.join(BLOG_DIR, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const { meta } = parseFrontmatter(content)

    const slug = (meta.slug as string) || file.replace(/\.md$/, '')

    return {
      slug,
      title: (meta.title as string) || 'Untitled',
      description: (meta.description as string) || '',
      date: (meta.date as string) || '',
      author: (meta.author as string) || 'RetroShift Team',
      tags: (meta.tags as string[]) || [],
    }
  })

  // Sort by date descending (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getBlogPost(slug: string): BlogPost | null {
  if (!fs.existsSync(BLOG_DIR)) {
    return null
  }

  const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'))

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const { meta, body } = parseFrontmatter(content)

    const postSlug = (meta.slug as string) || file.replace(/\.md$/, '')

    if (postSlug === slug) {
      return {
        slug: postSlug,
        title: (meta.title as string) || 'Untitled',
        description: (meta.description as string) || '',
        date: (meta.date as string) || '',
        author: (meta.author as string) || 'RetroShift Team',
        tags: (meta.tags as string[]) || [],
        content: body.trim(),
      }
    }
  }

  return null
}

export function getAllBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return []
  }

  const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'))

  return files.map(file => {
    const filePath = path.join(BLOG_DIR, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const { meta } = parseFrontmatter(content)
    return (meta.slug as string) || file.replace(/\.md$/, '')
  })
}
