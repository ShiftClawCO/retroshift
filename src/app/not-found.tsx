import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="text-center p-8 max-w-md">
        <CardContent>
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Pagina non trovata</h1>
          <p className="text-muted-foreground mb-6">La pagina che stai cercando non esiste.</p>
          <Button asChild>
            <Link href="/">Torna alla home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
