"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, Code2, Layers, Database } from "lucide-react"
import { Button } from "@repo/ui/components/button"
import { motion } from "framer-motion"

const developers = [
  {
    icon: Code2,
    title: "Competitive\nProgrammer",
    image: "https://cs.uwaterloo.ca/sites/default/files/uploads/images/waterloo-team-kevin-ramazan-andrew-troy.jpg",
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
    title: "FullStack\nDeveloper",
    image: "https://i.pinimg.com/1200x/3b/11/6f/3b116fe0a42f237db712964799c6dae7.jpg",
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
    title: "Algorithm\nSpecialist",
    image: "https://i.pinimg.com/736x/bb/1a/44/bb1a44a9ee92d1d5f6314059bd0055e6.jpg",
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
  const [charCount, setCharCount] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  const lines = text.split("\n")

  useEffect(() => {
    if (!isVisible) {
      setCharCount(0)
      return
    }

    let index = 0
    const timer = setInterval(() => {
      if (index <= text.length) {
        setCharCount(index)
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

  let currentIndex = 0;

  return (
    <span className="font-mono flex flex-col leading-tight">
      {lines.map((line, i) => {
        const lineStart = currentIndex;
        const lineEnd = lineStart + line.length;
        
        // Next line starts after this line + the '\n' character
        currentIndex = lineEnd + 1;

        // Number of characters to display for this specific line
        const displayLength = Math.max(0, Math.min(line.length, charCount - lineStart));
        const displayedContent = line.slice(0, displayLength);
        
        // The cursor sits on this line if charCount is within this line's range
        // If it's the very last line, cursor stays at the end of it when charCount >= text.length
        const isLastLine = i === lines.length - 1;
        const isCursorHere = 
          (charCount >= lineStart && charCount <= lineEnd) || 
          (isLastLine && charCount > lineEnd);

        return (
          <span key={i} className="min-h-[1.2em] block relative">
            {displayedContent}
            {isCursorHere && (
              <span
                className={`inline-block w-[2px] h-[1em] ml-0.5 align-middle bg-gradient-to-b from-primary to-accent transition-opacity duration-100 ${showCursor ? "opacity-100" : "opacity-0"}`}
              />
            )}
          </span>
        )
      })}
    </span>
  )
}

export function DeveloperShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % developers.length)
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + developers.length) % developers.length)
  }

  return (
    <section className="py-24 border-t border-border overflow-hidden">
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
          <div className="flex gap-2 z-20 relative">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background"
              onClick={handlePrev}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background"
              onClick={handleNext}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto h-[550px] md:h-[600px] flex items-center justify-center perspective-[1200px]">
        {developers.map((dev, index) => {
          const isActive = index === activeIndex;
          const N = developers.length;
          const offset = ((index - activeIndex + N + Math.floor(N / 2)) % N) - Math.floor(N / 2);
          
          return (
            <motion.div
              key={dev.title}
              className="absolute w-[85vw] md:w-[60vw] lg:w-[45vw] cursor-pointer"
              onClick={() => setActiveIndex(index)}
              initial={false}
              animate={{
                x: `calc(${offset * 85}%)`, 
                scale: isActive ? 1 : 0.85,
                opacity: isActive ? 1 : 0.5,
                zIndex: developers.length - Math.abs(offset),
              }}
              transition={{
                duration: 0.6,
                ease: [0.32, 0.8, 0, 1] 
              }}
            >
              <div
                className={`relative rounded-3xl overflow-hidden aspect-[16/10] bg-gradient-to-br ${dev.gradient} border border-white/10 shadow-xl flex items-center justify-center`}
              >
                {dev.image ? (
                  <>
                    <img 
                      src={dev.image} 
                      alt={dev.title} 
                      className="absolute inset-0 w-full h-full object-cover object-center" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="relative z-10 w-full p-6 md:p-10 flex flex-col justify-end h-full">
                      <p className="text-2xl md:text-3xl lg:text-5xl font-semibold tracking-tight text-white mb-2 text-left drop-shadow-lg">
                        <TypewriterText text={dev.title} isVisible={isActive} />
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{ background: dev.bgPattern }}
                    />
                    <div className="relative text-white text-center px-8 flex flex-col items-center justify-center h-full">
                      <dev.icon className="h-12 w-12 md:h-16 md:w-16 mb-4 md:mb-6 opacity-90 drop-shadow-md" />
                      <p className="text-2xl md:text-3xl lg:text-5xl font-bold tracking-tight">
                        <TypewriterText text={dev.title} isVisible={isActive} />
                      </p>
                    </div>
                  </>
                )}
              </div>

              <motion.div 
                animate={{ 
                  opacity: isActive ? 1 : 0, 
                  y: isActive ? 0 : 20,
                  pointerEvents: isActive ? "auto" : "none"
                }}
                transition={{ duration: 0.4, delay: isActive ? 0.2 : 0 }}
                className="mt-6 md:mt-8 text-center px-4"
              >
                <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3">{dev.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
                  {dev.description}
                </p>
                <a
                  href={dev.link}
                  className="inline-flex items-center gap-2 mt-4 md:mt-6 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
                >
                  {dev.linkText}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
