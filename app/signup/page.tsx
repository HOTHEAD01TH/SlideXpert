'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signup, signInWithGoogle } from "@/app/actions/auth"
import { FcGoogle } from "react-icons/fc"
import Link from 'next/link'

export default function SignUpPage() {
  const [error, setError] = useState<{ message: string; field?: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signup({ email, password })
    
    if (!result.success && result.error) {
      setError(result.error)
    } else {
      // Show success message about email verification
      setError({ message: "Please check your email to verify your account!", field: "success" })
    }

    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    try {
      setError(null)
      setLoading(true)
      const { data, error } = await signInWithGoogle()
      
      if (error) {
        setError({ message: error.message })
        return
      }

      // Supabase OAuth returns a URL to redirect to
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError({ message: 'Failed to sign in with Google' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up to get started with our platform.
          </p>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <FcGoogle className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`text-sm text-center ${error.field === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {error.message}
            </div>
          )}
          
          <Input
            name="email"
            type="email"
            placeholder="Email"
            required
            className={error?.field === 'email' ? 'border-red-500' : ''}
          />
          
          <Input
            name="password"
            type="password"
            placeholder="Password"
            required
            className={error?.field === 'password' ? 'border-red-500' : ''}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/signin" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

