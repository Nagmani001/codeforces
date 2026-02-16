"use client"

import { useEffect, useRef, useState } from "react"
import { UserPlus, Code2, Trophy, TrendingUp } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Create Your Account",
    description: "Sign up in seconds and set up your profile. Choose your preferred programming languages and difficulty level.",
  },
  {
    icon: Code2,
    number: "02",
    title: "Solve Problems",
    description: "Browse our extensive library of algorithmic problems. Filter by difficulty, topic, or contest. Write and test your solutions in our online editor.",
  },
  {
    icon: Trophy,
    number: "03",
    title: "Compete in Contests",
    description: "Join regular rated contests to test your skills against programmers worldwide. Earn your rating and climb the global leaderboard.",
  },
  {
    icon: TrendingUp,
    number: "04",
    title: "Track Your Growth",
    description: "Monitor your progress with detailed analytics. See your rating history, problem-solving streaks, and areas for improvement.",
  },
]

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[number]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`relative transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <step.icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div>
          <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Step {step.number}
          </span>
          <h3 className="text-xl font-semibold text-foreground mt-1">{step.title}</h3>
          <p className="mt-2 text-muted-foreground leading-relaxed">{step.description}</p>
        </div>
      </div>

      {/* Connector line */}
      {index < steps.length - 1 && (
        <div className="ml-7 mt-4 mb-4 w-px h-8 bg-border" />
      )}
    </div>
  )
}

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="md:sticky md:top-24">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-md">
              Get started in minutes. Our platform is designed to help you grow from beginner to expert.
            </p>
          </div>

          <div className="space-y-2">
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
