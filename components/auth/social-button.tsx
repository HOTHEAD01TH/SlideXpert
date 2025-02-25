"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SocialButtonProps {
  provider: "google" | "facebook"
}

export function SocialButton({ provider }: SocialButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      // Here you would integrate with your auth provider's social login
      // For example with NextAuth.js:

      // update social button to use nextauth 
      

// components/auth/social-button.tsx
// 'use client'

// import { useState } from 'react'
// import { signIn } from 'next-auth/react'
// import { Button } from '@/components/ui/button'
// import { Loader2 } from 'lucide-react'

// export function SocialButton({ provider }) {
//   const [isLoading, setIsLoading] = useState(false)
  
//   const handleClick = async () => {
//     setIsLoading(true)
//     try {
//       await signIn(provider, { callbackUrl: '/dashboard' })
//     } catch (error) {
//       console.error(`${provider} login error:`, error)
//       setIsLoading(false)
//     }
//   }
  

// }


      
      // await signIn(provider, { callbackUrl: '/dashboard' })

      // For demo purposes, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real app, the auth provider would handle the redirect
      window.location.href = "/dashboard"
    } catch (error) {
      console.error(`${provider} login error:`, error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SocialIcon provider={provider} />}
      {provider === "google" ? "Google" : "Facebook"}
    </Button>
  )
}

function SocialIcon({ provider }: { provider: "google" | "facebook" }) {
  if (provider === "google") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 12 h8"></path>
        <path d="M12 8 v8"></path>
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  )
}

