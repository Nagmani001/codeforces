import { Suspense } from "react"
import Link from "next/link"
import { Code2 } from "lucide-react"
import { SignInForm } from "../../../../components/signin-form"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-foreground/10 via-transparent to-transparent" />
        <div className="relative flex flex-col justify-center px-12 xl:px-20">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <Code2 className="h-10 w-10 text-primary-foreground" />
            <span className="text-2xl font-bold text-primary-foreground">Codeforces</span>
          </Link>
          <h1 className="text-4xl xl:text-5xl font-bold text-primary-foreground leading-tight">
            Welcome Back, Programmer
          </h1>
          <p className="mt-6 text-lg text-primary-foreground/80">
            Continue your journey to becoming a better competitive programmer. Your next contest awaits.
          </p>
          <div className="mt-12 p-6 bg-primary-foreground/10 rounded-lg backdrop-blur-sm">
            <p className="text-primary-foreground font-medium mb-2">Upcoming Contest</p>
            <p className="text-2xl font-bold text-primary-foreground">Codeforces Round #925</p>
            <p className="text-primary-foreground/70 mt-1">Starts in 2 days, 14 hours</p>
          </div>
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  )
}
