"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Code2, ListChecks, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const navItems = [
    { href: "/problems", label: "Problems", icon: ListChecks },
    { href: "/arena/1", label: "Arena", icon: Code2 },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/problems" className="mr-8 flex items-center gap-2 font-semibold">
          <Code2 className="h-5 w-5 text-primary" />
          <span>CodeArena</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2",
                  pathname.startsWith(item.href.split("/")[1] === "arena" ? "/arena" : item.href) &&
                  "bg-secondary text-secondary-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
