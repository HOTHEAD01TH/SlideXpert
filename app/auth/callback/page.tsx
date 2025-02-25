'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // First, try to get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (session) {
          console.log("Session found, redirecting to dashboard")
          router.push('/dashboard')
          return
        }

        // If no session, check for hash parameters (email verification)
        const hash = window.location.hash
        if (hash) {
          const params = new URLSearchParams(hash.substring(1))
          const accessToken = params.get('access_token')
          
          if (accessToken) {
            const { data: { user }, error } = await supabase.auth.getUser(accessToken)
            if (user) {
              console.log("Email verified, redirecting to dashboard")
              router.push('/dashboard')
              return
            }
          }
        }

        // If no session and no hash, check for error parameters
        const error = searchParams.get('error')
        const error_description = searchParams.get('error_description')
        
        if (error) {
          console.error("Auth error:", error, error_description)
          router.push(`/signin?error=${encodeURIComponent(error_description || 'Authentication failed')}`)
          return
        }

        // If nothing works, redirect to signin
        console.log("No session or verification found, redirecting to signin")
        router.push('/signin')
      } catch (error) {
        console.error("Callback error:", error)
        router.push('/signin')
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Verifying your account...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  )
} 