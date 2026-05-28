import Link from "next/link"
import { Button } from "@repo/ui/components/button"
import { ArrowRight, Trophy } from "lucide-react"
import { ParticleBackground } from "./particle-background"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[80vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center">
      {/* Subtle radial gradient behind particles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      {/* Interactive particle dots */}
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-20 lg:py-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 md:mb-6 backdrop-blur-sm">
            <Trophy className="h-4 w-4 shrink-0" />
            <span className="text-balance">Join 500,000+ competitive programmers</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground text-balance">
            Master Algorithms.
            <span className="text-primary"> Win Contests.</span>
          </h1>

          <p className="mt-4 md:mt-6 text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl text-pretty px-2 sm:px-0">
            The ultimate platform for competitive programming. Solve challenging problems, compete in rated contests,
            and climb the global rankings.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 md:mt-10 w-full sm:w-auto px-4 sm:px-0">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto min-h-[44px] px-6 md:px-8">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto min-h-[44px] px-6 md:px-8 bg-transparent backdrop-blur-sm">
              Explore Problems
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-12 md:mt-16 pt-6 md:pt-8 border-t border-border/50 backdrop-blur-sm w-full max-w-lg sm:max-w-none">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">10K+</span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">Problems</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">500+</span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">Contests/Year</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">200+</span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">Countries</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
