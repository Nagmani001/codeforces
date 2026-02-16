"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Code2, Layers, Database } from "lucide-react"
import { Button } from "@repo/ui/components/button"

const developers = [
  {
    icon: Code2,
    title: "Competitive Programmer",
    gradient: "from-blue-600 via-indigo-600 to-violet-700",
    darkGradient: "dark:from-blue-500 dark:via-indigo-500 dark:to-violet-600",
    description:
      "Sharpen your algorithmic skills by solving thousands of problems. Participate in rated contests, climb the leaderboards, and measure your growth over time.",
    link: "/problems",
    linkText: "Explore problems",
    bgPattern: "radial-gradient(circle at 30% 70%, rgba(59,130,246,0.15) 0%, transparent 50%)",
  },
  {
    icon: Layers,
    title: "Full Stack Developer",
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    darkGradient: "dark:from-emerald-500 dark:via-teal-500 dark:to-cyan-600",
    description:
      "Build production-ready projects with confidence. Our platform helps you practice data structures and system design patterns used in real-world applications.",
    link: "/problems",
    linkText: "View challenges",
    bgPattern: "radial-gradient(circle at 70% 30%, rgba(16,185,129,0.15) 0%, transparent 50%)",
  },
  {
    icon: Database,
    title: "Algorithm Specialist",
    gradient: "from-orange-600 via-rose-600 to-pink-700",
    darkGradient: "dark:from-orange-500 dark:via-rose-500 dark:to-pink-600",
    description:
      "Deep dive into advanced algorithms and optimization techniques. Master graph theory, dynamic programming, and number theory through curated problem sets.",
    link: "/problems",
    linkText: "Start learning",
    bgPattern: "radial-gradient(circle at 50% 50%, rgba(244,63,94,0.15) 0%, transparent 50%)",
  },
]

function TypewriterText({ text, isVisible }: { text: string; isVisible: boolean }) {
  const [displayText, setDisplayText] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (!isVisible) {
      setDisplayText("")
      return
    }

    let index = 0
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index))
        index++
      } else {
        clearInterval(timer)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [text, isVisible])

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(cursorTimer)
  }, [])

  return (
    <span className="font-mono">
      {displayText}
      <span
        className={`inline-block w-[2px] h-[1em] ml-0.5 align-middle bg-gradient-to-b from-primary to-accent transition-opacity duration-100 ${showCursor ? "opacity-100" : "opacity-0"}`}
      />
    </span>
  )
}

export function DeveloperShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsInView(entry.isIntersecting)
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, developers.length - 1))
    setActiveIndex(clamped)
    if (scrollContainerRef.current) {
      const child = scrollContainerRef.current.children[clamped] as HTMLElement
      if (child) {
        child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" })
      }
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const childWidth = container.scrollWidth / developers.length
      const newIndex = Math.round(scrollLeft / childWidth)
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < developers.length) {
        setActiveIndex(newIndex)
      }
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [activeIndex])

  return (
    <section ref={sectionRef} className="py-24 border-t border-border">
      <div className="container px-4 mx-auto max-w-7xl mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              Built for every developer
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Whether you&apos;re preparing for competitions, building projects, or mastering algorithms
              &mdash; our platform adapts to your journey.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent"
              onClick={() => scrollTo(activeIndex - 1)}
              disabled={activeIndex === 0}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent"
              onClick={() => scrollTo(activeIndex + 1)}
              disabled={activeIndex === developers.length - 1}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory px-4 md:px-[max(1rem,calc((100vw-80rem)/2+1rem))] pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {developers.map((dev, index) => (
          <div
            key={dev.title}
            className={`snap-start flex-shrink-0 w-[85vw] md:w-[60vw] lg:w-[50vw] transition-opacity duration-500 ${
              activeIndex === index ? "opacity-100" : "opacity-40"
            }`}
          >
            <div
              className={`relative rounded-2xl overflow-hidden aspect-[16/10] bg-gradient-to-br ${dev.gradient} ${dev.darkGradient} flex items-center justify-center`}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{ background: dev.bgPattern }}
              />
              <div className="relative text-white text-center px-8">
                <dev.icon className="h-12 w-12 mx-auto mb-4 opacity-80" />
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold">
                  <TypewriterText
                    text={dev.title}
                    isVisible={isInView && activeIndex === index}
                  />
                </p>
              </div>
            </div>

            <div className={`mt-6 transition-all duration-500 delay-200 ${
              activeIndex === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}>
              <h3 className="text-xl font-semibold text-foreground">{dev.title}</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed max-w-lg">
                {dev.description}
              </p>
              <a
                href={dev.link}
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                {dev.linkText}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
