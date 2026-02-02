import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileQuestion } from 'lucide-react'

export default function RetroNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="text-center p-8 max-w-md w-full">
        <CardContent className="pt-0">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <FileQuestion className="w-8 h-8 text-muted-foreground" />
          </div>
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
