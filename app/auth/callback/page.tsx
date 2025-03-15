'use client'

import { Suspense } from 'react'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error("Session error:", sessionError)
          router.push('/signin')
          return
        }

        if (session) {
          console.log("Session found, redirecting to dashboard")
          router.replace('/dashboard')
          return
        }

        // If no session and no error, redirect to signin
        console.log("No session found, redirecting to signin")
        router.replace('/signin')
      } catch (error) {
        console.error("Callback error:", error)
        router.replace('/signin')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Verifying your account...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
} 