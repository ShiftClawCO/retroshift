'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

interface User {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  profilePictureUrl?: string | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true })

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ 
  children,
  workosUser 
}: { 
  children: ReactNode
  workosUser: User | null 
}) {
  const [synced, setSynced] = useState(false)
  const syncUser = useMutation(api.users.upsert)

  useEffect(() => {
    if (workosUser && !synced) {
      // Sync user to Convex
      syncUser({
        workosId: workosUser.id,
        email: workosUser.email,
        name: [workosUser.firstName, workosUser.lastName].filter(Boolean).join(' ') || undefined,
        avatarUrl: workosUser.profilePictureUrl ?? undefined,
      }).then(() => setSynced(true))
        .catch(console.error)
    }
  }, [workosUser, synced, syncUser])

  return (
    <AuthContext.Provider value={{ user: workosUser, isLoading: false }}>
      {children}
    </AuthContext.Provider>
  )
}
