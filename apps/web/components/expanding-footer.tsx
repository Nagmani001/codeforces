"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Code2, ArrowRight } from "lucide-react"
import { Button } from "@repo/ui/components/button"

export function ExpandingFooter() {
  const footerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.85)

  useEffect(() => {
    const handleScroll = () => {
      if (!footerRef.current) return

      const rect = footerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calculate how much of the footer is in view
      const visibleTop = Math.max(0, windowHeight - rect.top)
      const totalHeight = rect.height + windowHeight
      const progress = Math.min(1, Math.max(0, visibleTop / (totalHeight * 0.5)))

      // Scale from 0.85 to 1
      const newScale = 0.85 + progress * 0.15
      setScale(newScale)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div ref={footerRef} className="relative overflow-hidden">
      {/* CTA card that scales up */}
      <div
        className="mx-4 md:mx-8 mb-8 rounded-3xl bg-primary text-primary-foreground overflow-hidden transition-transform duration-100 ease-out"
        style={{ transform: `scale(${scale})`, transformOrigin: "center bottom" }}
      >
        <div className="relative px-8 py-16 md:px-16 md:py-24">
          {/* Speckled noise background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

          <div className="relative max-w-3xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Ready to level up your competitive programming?
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 px-8 text-foreground"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/problems">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-8 bg-transparent"
                >
                  Explore Problems
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Actual Footer */}
      <footer className="bg-muted/50 border-t border-border">
        <div className="container px-4 py-16 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <Code2 className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">Codeforces</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                The leading platform for competitive programming and algorithmic contests. Practice, compete, and grow.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/problems" className="hover:text-foreground transition-colors">
                    Problemset
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contests
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Gym
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Ratings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Community</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Forum
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Top Rated
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">&copy; 2026 Codeforces. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Twitter
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                GitHub
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                YouTube
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
