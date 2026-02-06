'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from './AuthProvider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Zap, List, LogOut, User, Settings } from 'lucide-react'

export default function Header() {
  const t = useTranslations()
  const { user: workosUser } = useAuth()
  const convexUser = useQuery(
    api.users.getByWorkosId,
    workosUser ? { workosId: workosUser.id } : 'skip'
  )
  
  const isLoggedIn = !!workosUser
  const displayName = workosUser?.firstName || workosUser?.email?.split('@')[0] || 'User'
  const avatarUrl = workosUser?.profilePictureUrl

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-2">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        width={28}
                        height={28}
                        className="rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {displayName}
                  </div>
                  <div className="px-2 pb-1.5 text-xs text-muted-foreground">
                    {workosUser?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      {t('settings.title')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/auth/signout" className="cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
