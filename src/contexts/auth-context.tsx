'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService, AuthUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // For demo purposes, set a mock user if no auth is configured
    // In production, this would use real Supabase auth
    const initAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
        } else {
          // For demo - set mock user
          setUser({
            id: 'demo-user',
            email: 'jeff.franzen2@redcross.org',
            profile: {
              id: 'demo-profile',
              email: 'jeff.franzen2@redcross.org',
              first_name: 'Jeff',
              last_name: 'Franzen',
              role: 'chapter_user',
              notifications_enabled: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          })
        }
      } catch (error) {
        console.error('Auth error, using demo user:', error)
        // Set demo user on error
        setUser({
          id: 'demo-user',
          email: 'jeff.franzen2@redcross.org',
          profile: {
            id: 'demo-profile',
            email: 'jeff.franzen2@redcross.org',
            first_name: 'Jeff',
            last_name: 'Franzen',
            role: 'chapter_user',
            notifications_enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes (if Supabase is configured)
    try {
      const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
        setUser(user)
        setIsLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('Auth listener error:', error)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    await AuthService.signIn(email, password)
    const currentUser = await AuthService.getCurrentUser()
    setUser(currentUser)
    router.push('/')
  }

  const signOut = async () => {
    try {
      await AuthService.signOut()
    } catch (error) {
      // For demo mode, just clear the user
      console.log('Sign out in demo mode')
    }
    setUser(null)
    // For demo, just refresh the page to reset
    window.location.href = '/'
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    await AuthService.signUp(email, password, metadata)
    // After signup, user needs to verify email
    router.push('/signin?message=Please check your email to verify your account')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}