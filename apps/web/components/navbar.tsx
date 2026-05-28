"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ListChecks, Moon, Sun, User, LogOut, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@repo/ui/components/button"
import { cn } from "@repo/ui/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@repo/ui/components/sheet"
import { authClient } from "../lib/auth"
import { BrandLogo } from "./brand-logo"

export function Navbar({ user }: {
  user: any | undefined
}) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const router = useRouter();

  const navItems = [
    { href: "/problems", label: "Problems", icon: ListChecks },
  ]

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/signin")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-screen-2xl mx-auto flex h-14 min-h-[44px] items-center justify-between gap-2 px-4 md:px-6 lg:px-8">
        <Link href="/problems" className="flex shrink-0 items-center gap-2 font-semibold">
          <BrandLogo className="h-5 w-5" />
          <span className="text-sm sm:text-base">Codeforces</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 min-h-[44px]",
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

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="min-h-[44px] min-w-[44px]"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-hidden">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user.name[0].toUpperCase()
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleSignOut} variant="destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost" size="sm" className="min-h-[44px]">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="min-h-[44px]">Sign Up</Button>
                </Link>
              </>
            )}
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
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 text-lg font-medium min-h-[44px] px-1",
                      pathname.startsWith(item.href) && "text-primary"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-border pt-4 flex flex-col gap-2">
                  {user ? (
                    <>
                      <div className="px-1 py-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Link href="/profile">
                        <Button variant="outline" className="w-full min-h-[44px] justify-start gap-2">
                          <User className="h-4 w-4" />
                          Profile
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        className="w-full min-h-[44px]"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/signin">
                        <Button variant="outline" className="w-full min-h-[44px]">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button className="w-full min-h-[44px]">Sign Up</Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
