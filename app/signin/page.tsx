import { SigninForm } from "@/components/auth/signin-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function SigninPage() {
  return (
    <AuthLayout
      heading="Welcome back"
      subheading="Enter your credentials to sign in to your account"
      linkText="Don't have an account?"
      linkHref="/signup"
      linkLabel="Sign up"
    >
      <SigninForm />
    </AuthLayout>
  )
}

