import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { SignInForm } from "../../../../components/signin-form"
import { BrandLogo } from "../../../../components/brand-logo"
import dashboard from "../../../../public/dashboard3.png"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col items-start pt-8 xl:pt-12 h-screen">

        {/* Text Section */}
        <div className="relative z-10 w-full px-12 xl:px-20 flex-shrink-0">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 xl:mb-10">
            <BrandLogo className="h-8 w-8" priority />
            <span className="text-2xl font-bold text-primary-foreground tracking-tight">Codeforces</span>
          </Link>

          <h1 className="text-3xl lg:text-4xl xl:text-[2.5rem] 2xl:text-[2.75rem] font-bold text-primary-foreground leading-[1.15] mb-5 w-full drop-shadow-sm whitespace-nowrap">
            Join the World's Largest<br />Competitive Programming <br/>Community
          </h1>
          <p className="text-base text-primary-foreground/80 font-medium tracking-wide">
            Solve algorithmic challenges, compete in rated contests, and become a better programmer.
          </p>
        </div>

        {/* Floating Dashboard Mockup */}
        <div className="relative z-10 w-full px-12 xl:px-20 mt-8 flex-1 flex flex-col justify-start pb-8 overflow-visible min-h-0 scale-110">
          <div className="relative w-full max-w-[800px] max-h-full flex rounded-2xl overflow-hidden   rotate-[-1.5deg] hover:rotate-0 hover:-translate-y-2 transition-all duration-700 ease-out origin-top-left">
            <Image 
              src={dashboard} 
              alt="Platform Dashboard" 
              className="w-full h-auto max-h-full object-contain object-top-left"
              priority
            />
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
