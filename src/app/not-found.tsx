import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="text-center p-8 max-w-md w-full">
        <CardContent className="pt-0">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <SearchX className="w-8 h-8 text-muted-foreground" />
          </div>
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
