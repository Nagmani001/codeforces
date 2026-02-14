"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent } from "@repo/ui/components/card"
import { cn } from "@repo/ui/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"]
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function CalendarWidget() {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const todayDate = today.getDate()
  const todayMonth = today.getMonth()
  const todayYear = today.getFullYear()

  const isCurrentMonth = viewMonth === todayMonth && viewYear === todayYear

  // Mock activity data — days with submissions
  const activityDays = useMemo(() => new Set([1, 2, 3, 4, 5, 18]), [])

  // Build calendar grid
  const calendarRows = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const rows: (number | null)[][] = []
    let row: (number | null)[] = []

    for (let i = 0; i < firstDay; i++) row.push(null)

    for (let day = 1; day <= daysInMonth; day++) {
      row.push(day)
      if (row.length === 7) {
        rows.push(row)
        row = []
      }
    }

    if (row.length > 0) {
      while (row.length < 7) row.push(null)
      rows.push(row)
    }

    // Always render 6 rows to prevent layout shift
    while (rows.length < 6) {
      rows.push(Array(7).fill(null))
    }

    return rows
  }, [viewMonth, viewYear])

  // Countdown timer — time remaining in the day
  const [timeLeft, setTimeLeft] = useState("")
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      const diff = end.getTime() - now.getTime()
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0")
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0")
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0")
      setTimeLeft(`${h}:${m}:${s}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  return (
    <Card className="border-border/50 shadow-sm">
      {/* Header: Day info + hexagon badge */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold">Day {todayDate}</span>
            <span className="text-xs text-orange-400 ml-2">{timeLeft} left</span>
          </div>

          {/* Hexagonal date badge */}
          <div className="relative">
            <svg width="48" height="52" viewBox="0 0 48 52">
              <polygon
                points="24,2 46,14 46,38 24,50 2,38 2,14"
                fill="rgba(16,185,129,0.08)"
                stroke="#10b981"
                strokeWidth="2"
                opacity="0.7"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-emerald-400 leading-none">{todayDate}</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">
                {MONTH_NAMES[todayMonth]}
              </span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4 pt-0">
        {/* Month navigation */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <button
            onClick={prevMonth}
            className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-muted-foreground min-w-[72px] text-center">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {!isCurrentMonth && (
            <button
              onClick={() => { setViewMonth(todayMonth); setViewYear(todayYear) }}
              className="text-xs text-emerald-400 hover:text-emerald-300 ml-1 transition-colors"
            >
              Today
            </button>
          )}
        </div>

        {/* Calendar grid */}
        <div>
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map((d, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground font-medium py-1.5">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          {calendarRows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-7">
              {row.map((day, di) => {
                const isToday = isCurrentMonth && day === todayDate
                const hasActivity = day !== null && activityDays.has(day)
                return (
                  <div key={di} className="flex flex-col items-center py-1">
                    {day !== null ? (
                      <>
                        <div
                          className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors",
                            isToday
                              ? "bg-emerald-500 text-white font-bold"
                              : "text-foreground/80 hover:bg-muted/60 cursor-pointer"
                          )}
                        >
                          {day}
                        </div>
                        {hasActivity && !isToday && (
                          <div className="h-1 w-1 rounded-full bg-orange-500 mt-0.5" />
                        )}
                      </>
                    ) : (
                      <div className="w-8 h-8" />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Weekly Premium section */}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0L10 6H16L11 9.5L13 16L8 12L3 16L5 9.5L0 6H6L8 0Z" />
            </svg>
            <span className="font-semibold">0</span>
            <span className="text-muted-foreground">Redeem</span>
          </div>
          <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            Rules
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
