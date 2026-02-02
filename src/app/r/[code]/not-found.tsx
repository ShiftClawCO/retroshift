import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function RetroNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="text-center p-8 max-w-md">
        <CardContent>
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Retro non trovata</h1>
          <p className="text-muted-foreground mb-6">
            Il link potrebbe essere scaduto o non valido.
          </p>
          <Button asChild>
            <Link href="/">Crea una nuova retro</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
