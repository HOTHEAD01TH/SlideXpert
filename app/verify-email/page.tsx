import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent you a verification link to complete your signup.
          </p>
        </div>
        <div className="rounded-md bg-secondary p-4">
          <p className="text-sm text-secondary-foreground">
            Please check your inbox and click the verification link to activate your account.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Didn't receive an email? Check your spam folder or{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline hover:underline-offset-4">
            try again
          </Link>
          .
        </p>
        <Button asChild variant="outline">
          <Link href="/signin">Back to Sign In</Link>
        </Button>
      </div>
    </div>
  )
}

