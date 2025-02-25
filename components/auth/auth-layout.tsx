import type React from "react"
import Link from "next/link"

interface AuthLayoutProps {
  children: React.ReactNode
  heading: string
  subheading: string
  linkText: string
  linkHref: string
  linkLabel: string
}

export function AuthLayout({ children, heading, subheading, linkText, linkHref, linkLabel }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subheading}</p>
          <p className="mt-2 text-sm">
            {linkText}{" "}
            <Link
              href={linkHref}
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/90"
            >
              {linkLabel}
            </Link>
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}

