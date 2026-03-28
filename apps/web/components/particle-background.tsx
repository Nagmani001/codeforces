"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

export function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (typeof window === "undefined" || typeof CSS === "undefined") return
    if (!("paintWorklet" in CSS)) return

    // Register the exact same PaintWorklet from the reference
    ;(CSS as any).paintWorklet.addModule(
      "https://unpkg.com/css-houdini-ringparticles/dist/ringparticles.js"
    )

    // Inject the exact @property declarations and @keyframes from the reference CSS
    const style = document.createElement("style")
    style.textContent = `
      @property --animation-tick {
        syntax: '<number>';
        inherits: false;
        initial-value: 0;
      }
      @property --ring-radius {
        syntax: '<number>';
        inherits: false;
        initial-value: 100;
      }
      @property --ring-x {
        syntax: '<number>';
        inherits: false;
        initial-value: 50;
      }
      @property --ring-y {
        syntax: '<number>';
        inherits: false;
        initial-value: 50;
      }
      @property --ring-interactive {
        syntax: '<number>';
        inherits: false;
        initial-value: 0;
      }

      @keyframes ring-particles-ripple {
        0% { --animation-tick: 0; }
        100% { --animation-tick: 1; }
      }
      @keyframes ring-particles-ring {
        0% { --ring-radius: 150; }
        100% { --ring-radius: 250; }
      }

      .ring-particles-bg {
        --ring-radius: 100;
        --ring-thickness: 750;
        --particle-count: 60;
        --particle-rows: 20;
        --particle-size: 2;
        --particle-min-alpha: 0.1;
        --particle-max-alpha: 1.0;
        --seed: 200;

        background-image: paint(ring-particles);
        animation: ring-particles-ripple 6s linear infinite,
                   ring-particles-ring 6s ease-in-out infinite alternate;
        transition: --ring-x 0.6s ease-out, --ring-y 0.6s ease-out;
      }
    `
    document.head.appendChild(style)
    styleRef.current = style

    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current)
        styleRef.current = null
      }
    }
  }, [])

  // Particle color: navy in light mode, lighter blue in dark mode
  const particleColor =
    resolvedTheme === "dark" ? "rgba(147, 180, 255, 1)" : "navy"

  return (
    <div
      ref={containerRef}
      className="ring-particles-bg absolute inset-0 w-full h-full pointer-events-none"
      style={
        {
          "--particle-color": particleColor,
          zIndex: 0,
        } as React.CSSProperties
      }
    />
  )
}
