import { SignupForm } from "@/components/auth/signup-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function SignupPage() {
  return (
    <AuthLayout
      heading="Create an account"
      subheading="Enter your details to create your account"
      linkText="Already have an account?"
      linkHref="/signin"
      linkLabel="Sign in"
    >
      <SignupForm />
    </AuthLayout>
  )
}

