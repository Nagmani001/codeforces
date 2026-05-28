"use client"

import Link from "next/link"
import { Button } from "@repo/ui/components/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@repo/ui/components/sheet"
import { ModeToggle } from "./themeToggle"
import { BrandLogo } from "./brand-logo"

export function NavbarLanding() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-14 sm:h-16 min-h-[44px] items-center justify-between px-4 md:px-6 lg:px-8 mx-auto max-w-screen-xl">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <BrandLogo className="h-7 w-7 sm:h-8 sm:w-8" />
          <span className="text-lg sm:text-xl font-bold text-foreground">Codeforces</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ModeToggle />
          <Link href="/signin">
            <Button variant="ghost" size="sm" className="min-h-[44px]">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="min-h-[44px]">Sign Up</Button>
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/" className="text-lg font-medium min-h-[44px] flex items-center">
                Home
              </Link>
              <Link href="#" className="text-lg font-medium min-h-[44px] flex items-center">
                Contests
              </Link>
              <Link href="#" className="text-lg font-medium min-h-[44px] flex items-center">
                Problemset
              </Link>
              <Link href="#" className="text-lg font-medium min-h-[44px] flex items-center">
                Gym
              </Link>
              <Link href="#" className="text-lg font-medium min-h-[44px] flex items-center">
                Ratings
              </Link>
              <div className="flex flex-col gap-2 mt-4 border-t border-border pt-4">
                <div className="flex items-center justify-between min-h-[44px]">
                  <span className="text-sm font-medium">Theme</span>
                  <ModeToggle />
                </div>
                <Link href="/signin">
                  <Button variant="outline" className="w-full min-h-[44px] bg-transparent">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="w-full min-h-[44px]">Sign Up</Button>
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
