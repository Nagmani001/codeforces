"use client"

import Link from "next/link"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { Badge } from "@repo/ui/components/badge"
import { cn } from "@repo/ui/lib/utils";
import { problems, useProblemsStore } from "../lib/temp";

const difficultyColors = {
  Easy: "text-accent",
  Medium: "text-chart-3",
  Hard: "text-destructive",
}

const statusIcons = {
  solved: <CheckCircle2 className="h-4 w-4 text-accent" />,
  attempted: <Clock className="h-4 w-4 text-chart-3" />,
  unsolved: <Circle className="h-4 w-4 text-muted-foreground" />,
}

export function ProblemsTable() {
  const { filters } = useProblemsStore()

  const filteredProblems = problems.filter((problem) => {
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
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50px]">Status</TableHead>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-[100px]">Difficulty</TableHead>
            <TableHead className="hidden md:table-cell">Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProblems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No problems found matching your filters.
              </TableCell>
            </TableRow>
          ) : (
            filteredProblems.map((problem) => (
              <TableRow key={problem.id} className="group">
                <TableCell>{statusIcons[problem.status]}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{problem.serialNumber}</TableCell>
                <TableCell>
                  <Link href={`/arena/${problem.id}`} className="font-medium hover:text-primary transition-colors">
                    {problem.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className={cn("font-medium", difficultyColors[problem.difficulty])}>{problem.difficulty}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {problem.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {problem.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{problem.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
