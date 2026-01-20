"use client"

import Link from "next/link"
import { CheckCircle2, Circle, Clock, ExternalLink } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { Badge } from "@repo/ui/components/badge"
import { cn } from "@repo/ui/lib/utils";
import { Problem, useProblemsStore } from "../lib/temp";

// LeetCode-style difficulty configurations
const difficultyConfig = {
  EASY: {
    label: "Easy",
    className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/25",
    dotClass: "bg-emerald-500",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-amber-500/15 text-amber-500 border-amber-500/20 hover:bg-amber-500/25",
    dotClass: "bg-amber-500",
  },
  HARD: {
    label: "Hard",
    className: "bg-red-500/15 text-red-500 border-red-500/20 hover:bg-red-500/25",
    dotClass: "bg-red-500",
  },
}

// Enhanced status icons with better visual feedback
const statusConfig = {
  SOLVED: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    className: "text-emerald-500",
    tooltip: "Solved",
  },
  ATTEMPTED: {
    icon: <Clock className="h-5 w-5" />,
    className: "text-amber-500",
    tooltip: "Attempted",
  },
  UNSOLVED: {
    icon: <Circle className="h-5 w-5" />,
    className: "text-muted-foreground/50",
    tooltip: "Not attempted",
  },
}

export function ProblemsTable({ problems }: {
  problems: Problem[]
}) {
  const { filters } = useProblemsStore()

  const filteredProblems = problems.filter((problem: Problem) => {
    if (filters.search && !problem.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.difficulty && problem.difficulty !== filters.difficulty) {
      return false
    }
    if (filters.status && problem.status !== filters.status) {
      return false
    }
    if (filters.tags.length > 0 && !filters.tags.some((tag) => problem.tags.includes(tag))) {
      return false
    }
    return true
  })

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/50 bg-muted/30">
            <TableHead className="w-[70px] h-14 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="w-[80px] h-14 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              #
            </TableHead>
            <TableHead className="h-14 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Title
            </TableHead>
            <TableHead className="w-[130px] h-14 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Difficulty
            </TableHead>
            <TableHead className="hidden md:table-cell h-14 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Tags
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProblems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Circle className="h-8 w-8 opacity-30" />
                  <p className="font-medium">No problems found</p>
                  <p className="text-sm opacity-70">Try adjusting your filters</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredProblems.map((problem, index) => {
              const difficulty = difficultyConfig[problem.difficulty]
              const status = statusConfig[problem.status]

              return (
                <TableRow
                  key={problem.id}
                  className={cn(
                    "group transition-all duration-200 cursor-pointer",
                    "hover:bg-muted/50 hover:shadow-[inset_4px_0_0_0] hover:shadow-primary/50",
                    index % 2 === 0 ? "bg-transparent" : "bg-muted/20"
                  )}
                >
                  {/* Status Column */}
                  <TableCell className="h-16 text-center">
                    <div className={cn(
                      "flex items-center justify-center transition-transform duration-200 group-hover:scale-110",
                      status.className
                    )}>
                      {status.icon}
                    </div>
                  </TableCell>

                  {/* Serial Number Column */}
                  <TableCell className="h-16">
                    <span className="font-mono text-sm text-muted-foreground font-medium">
                      {problem.serialNumber}
                    </span>
                  </TableCell>

                  {/* Title Column */}
                  <TableCell className="h-16">
                    <Link
                      href={`/arena/${problem.id}`}
                      className="group/link flex items-center gap-2 font-medium text-foreground hover:text-primary transition-colors duration-200"
                    >
                      <span className="group-hover/link:underline underline-offset-2">
                        {problem.title}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 text-muted-foreground" />
                    </Link>
                  </TableCell>

                  {/* Difficulty Column - LeetCode Style */}
                  <TableCell className="h-16">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors duration-200",
                      difficulty.className
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", difficulty.dotClass)} />
                      {difficulty.label}
                    </span>
                  </TableCell>

                  {/* Tags Column */}
                  <TableCell className="hidden md:table-cell h-16">
                    <div className="flex flex-wrap gap-1.5">
                      {problem.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs font-medium px-2.5 py-0.5 bg-secondary/50 hover:bg-secondary/80 transition-colors duration-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {problem.tags.length > 2 && (
                        <Badge
                          variant="outline"
                          className="text-xs font-medium px-2 py-0.5 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors duration-200"
                        >
                          +{problem.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {/* Footer with problem count */}
      {filteredProblems.length > 0 && (
        <div className="px-6 py-4 border-t border-border/50 bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredProblems.length}</span> of{" "}
            <span className="font-semibold text-foreground">{problems.length}</span> problems
          </p>
        </div>
      )}
    </div>
  )
}
