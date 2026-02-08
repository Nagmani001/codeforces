"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, CheckCircle2, Circle } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@repo/ui/components/sheet"
import { ScrollArea } from "@repo/ui/components/scroll-area"
import { cn } from "@repo/ui/lib/utils"
import axios from "axios"
import { BASE_URL } from "../../lib/config"

interface ProblemListItem {
  id: string
  title: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  status: "SOLVED" | "ATTEMPTED" | "UNSOLVED"
}

const difficultyConfig = {
  EASY: { label: "Easy", className: "text-green-500" },
  MEDIUM: { label: "Med.", className: "text-yellow-500" },
  HARD: { label: "Hard", className: "text-red-500" },
}

interface ProblemListDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentProblemId: string
}

export function ProblemListDrawer({ open, onOpenChange, currentProblemId }: ProblemListDrawerProps) {
  const [problems, setProblems] = useState<ProblemListItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const hasMore = useRef(true)
  const isFetching = useRef(false)
  const problemsRef = useRef<ProblemListItem[]>([])
  const scrollWrapperRef = useRef<HTMLDivElement>(null)

  async function fetchProblems(cursor?: string) {
    if (isFetching.current || !hasMore.current) return
    isFetching.current = true
    const url = cursor
      ? `${BASE_URL}/api/user/problems?cursor=${cursor}`
      : `${BASE_URL}/api/user/problems`
    try {
      const res = await axios.get(url, { withCredentials: true })
      const items: ProblemListItem[] = res.data.problems.map((x: any) => ({
        id: x.id,
        title: x.title,
        difficulty: x.problemType,
        status: x.submission?.length === 0 ? "UNSOLVED" : x.submission?.[0]?.status ?? "UNSOLVED",
      }))
      if (items.length < 15) {
        hasMore.current = false
      }
      setProblems(prev => {
        const newList = cursor ? [...prev, ...items] : items
        problemsRef.current = newList
        return newList
      })
    } catch {
    } finally {
      isFetching.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return
    setLoading(true)
    hasMore.current = true
    problemsRef.current = []
    setProblems([])
    fetchProblems()
  }, [open])

  useEffect(() => {
    if (!open) return
    const viewport = scrollWrapperRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
    if (!viewport) return
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport
      if (scrollHeight - scrollTop - clientHeight < 100 && !isFetching.current && hasMore.current && problemsRef.current.length > 0) {
        const lastId = problemsRef.current[problemsRef.current.length - 1]!.id
        fetchProblems(lastId)
      }
    }
    viewport.addEventListener('scroll', handleScroll)
    return () => viewport.removeEventListener('scroll', handleScroll)
  }, [open, problems])

  const filtered = problems.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.id.includes(search)
  )

  const solvedCount = problems.filter((p) => p.status === "SOLVED").length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[420px] sm:max-w-[420px] p-0 gap-0">
        {/* Header */}
        <SheetHeader className="border-b p-4 pb-3 pr-10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">Problem List</SheetTitle>
            <span className="text-xs text-muted-foreground">
              {solvedCount}/{problems.length} Solved
            </span>
          </div>
          <SheetDescription className="sr-only">Browse and select problems</SheetDescription>
          {/* Search */}
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-md border bg-transparent pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </SheetHeader>

        {/* Problem List */}
        <div ref={scrollWrapperRef}>
          <ScrollArea className="flex-1 h-[calc(100vh-120px)]">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                No problems found
              </div>
            ) : (
              <div className="flex flex-col">
                {filtered.map((problem, i) => {
                  const isCurrent = problem.id === currentProblemId
                  const diff = difficultyConfig[problem.difficulty]
                  return (
                    <Link
                      key={problem.id}
                      href={`/arena/${problem.id}`}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "flex items-center justify-between pl-4 pr-6 py-2.5 text-sm transition-colors hover:bg-muted/50",
                        isCurrent && "bg-muted",
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {problem.status === "SOLVED" ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                        ) : problem.status === "ATTEMPTED" ? (
                          <Circle className="h-4 w-4 shrink-0 text-yellow-500" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                        )}
                        <span className={cn("truncate", isCurrent && "font-medium")}>
                          {i + 1}. {problem.title}
                        </span>
                      </div>
                      <span className={cn("text-xs font-medium shrink-0 ml-3", diff.className)}>
                        {diff.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
