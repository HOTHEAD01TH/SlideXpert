// app/actions/auth.ts
'use server'

import { signIn } from 'next-auth/react'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

interface SignupData {
  email: string;
  password: string;
}

export async function signup(data: SignupData) {
  // Your signup logic here
  // This might involve creating a user in your database
  
  // Then sign them in
  return await signIn('credentials', {
    redirect: false,
    email: data.email,
    password: data.password,
  })
}

export async function login(data: SignupData) {
  return await signIn('credentials', {
    redirect: false,
    email: data.email,
    password: data.password,
  })
}