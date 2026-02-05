'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from './AuthProvider'
import { Button } from '@/components/ui/button'
import { Zap, Plus, List, LogOut } from 'lucide-react'

export default function Header() {
  const { user: workosUser } = useAuth()
  const convexUser = useQuery(
    api.users.getByWorkosId,
    workosUser ? { workosId: workosUser.id } : 'skip'
  )
  
  const isLoggedIn = !!workosUser

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Zap className="w-6 h-6 text-primary" />
          RetroShift
        </Link>

        <nav className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/my-retros">
                  <List className="w-4 h-4 mr-2" />
                  My Retros
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/create">
                  <Plus className="w-4 h-4 mr-2" />
                  New Retro
                </Link>
              </Button>
              <form action="/auth/signout" method="GET">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/create">Try Free</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
