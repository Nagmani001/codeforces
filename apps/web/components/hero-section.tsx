import Link from "next/link"
import { Button } from "@repo/ui/components/button"
import { ArrowRight, Trophy } from "lucide-react"
import { ParticleBackground } from "./particle-background"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Subtle radial gradient behind particles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      {/* Interactive particle dots */}
      <ParticleBackground />

      <div className="container relative z-10 px-4 mx-auto max-w-7xl py-20 md:py-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 backdrop-blur-sm">
            <Trophy className="h-4 w-4" />
            <span>Join 500,000+ competitive programmers</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground text-balance">
            Master Algorithms.
            <span className="text-primary"> Win Contests.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
            The ultimate platform for competitive programming. Solve challenging problems, compete in rated contests,
            and climb the global rankings.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-8">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 px-8 bg-transparent backdrop-blur-sm">
              Explore Problems
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border/50 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-foreground">10K+</span>
              <span className="text-sm text-muted-foreground mt-1">Problems</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-foreground">500+</span>
              <span className="text-sm text-muted-foreground mt-1">Contests/Year</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-foreground">200+</span>
              <span className="text-sm text-muted-foreground mt-1">Countries</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
