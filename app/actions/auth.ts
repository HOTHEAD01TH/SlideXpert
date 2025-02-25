// app/actions/auth.ts
'use server'

import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

export type AuthError = {
  message: string;
  field?: string;
}

interface SignupData {
  email: string;
  password: string;
}

export async function signup(data: SignupData): Promise<{ success: boolean; error?: AuthError }> {
  try {
    // Validate input
    const validatedData = signupSchema.parse(data)

    const { data: authData, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/callback`,
      }
    })

    if (error) throw error

    return {
      success: true
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: {
          message: firstError.message,
          field: firstError.path[0].toString()
        }
      }
    }

    return {
      success: false,
      error: {
        message: 'An error occurred during signup'
      }
    }
  }
}

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    })

    return { data, error: null }
  } catch (error: any) {
    console.error('Google sign in error:', error)
    return {
      data: null,
      error: {
        message: error.message || 'Failed to sign in with Google'
      }
    }
  }
}

export async function login(data: SignupData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    if (error) throw error

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Invalid email or password'
      }
    }
  }
}