"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, X, Filter } from "lucide-react"
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button"
import { Badge } from "@repo/ui/components/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover"
import { Checkbox } from "@repo/ui/components/checkbox";
import { Label } from "@repo/ui/components/label";
import { useProblemsStore } from "../lib/temp";
import { cn } from "@repo/ui/lib/utils";

export function ProblemsFilters({ allTags }: {
  allTags: string[]
}) {
  const { filters, setSearch, setDifficulty, setStatus, toggleTag, clearFilters } = useProblemsStore()
  const [tagsOpen, setTagsOpen] = useState(false)

  const activeFiltersCount = (filters.difficulty ? 1 : 0) + (filters.status ? 1 : 0) + filters.tags.length

  return (
    <div className="mb-6 space-y-4">
      {/* Main Filters Row */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search problems by title..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-background/50 border-border/50 focus-visible:border-primary/50 transition-colors duration-200"
          />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-border/50" />

        {/* Difficulty Select */}
        <Select
          value={filters.difficulty || "all"}
          onValueChange={(v) => setDifficulty(v === "all" ? null : (v as "EASY" | "MEDIUM" | "HARD"))}
        >
          <SelectTrigger className="w-[140px] h-11 bg-background/50 border-border/50 hover:border-primary/50 transition-colors duration-200">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                filters.difficulty === "EASY" && "bg-emerald-500",
                filters.difficulty === "MEDIUM" && "bg-amber-500",
                filters.difficulty === "HARD" && "bg-red-500",
                !filters.difficulty && "bg-muted-foreground/30"
              )} />
              <SelectValue placeholder="Difficulty" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                All Levels
              </span>
            </SelectItem>
            <SelectItem value="EASY">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Easy
              </span>
            </SelectItem>
            <SelectItem value="MEDIUM">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Medium
              </span>
            </SelectItem>
            <SelectItem value="HARD">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Hard
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Status Select */}
        <Select
          value={filters.status || "all"}
          onValueChange={(v) => setStatus(v === "all" ? null : (v as "SOLVED" | "ATTEMPTED" | "UNSOLVED"))}
        >
          <SelectTrigger className="w-[140px] h-11 bg-background/50 border-border/50 hover:border-primary/50 transition-colors duration-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="SOLVED">✓ Solved</SelectItem>
            <SelectItem value="ATTEMPTED">◔ Attempted</SelectItem>
            <SelectItem value="UNSOLVED">○ Unsolved</SelectItem>
          </SelectContent>
        </Select>

        {/* Tags Popover */}
        <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "gap-2 h-11 bg-background/50 border-border/50 hover:border-primary/50 transition-all duration-200",
                filters.tags.length > 0 && "border-primary/30 bg-primary/5"
              )}
            >
              <Filter className="h-4 w-4" />
              <span>Tags</span>
              {filters.tags.length > 0 && (
                <Badge
                  className="ml-1 h-5 px-1.5 bg-primary text-primary-foreground text-xs"
                >
                  {filters.tags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-4" align="start">
            <div className="mb-3 pb-2 border-b border-border/50">
              <h4 className="font-semibold text-sm">Filter by Tags</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Select the topics you want to practice</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
              {allTags.map((tag) => (
                <div
                  key={tag}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors duration-150",
                    filters.tags.includes(tag) ? "bg-primary/10" : "hover:bg-muted/50"
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  <Checkbox
                    id={tag}
                    checked={filters.tags.includes(tag)}
                    onCheckedChange={() => toggleTag(tag)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor={tag} className="text-sm cursor-pointer flex-1 truncate">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1.5 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </Button>
        )}
      </div>

      {/* Active Tags Display */}
      {filters.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">Active tags:</span>
          {filters.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors duration-200"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
