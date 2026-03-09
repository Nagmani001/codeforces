"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent } from "@repo/ui/components/card"
import { cn } from "@repo/ui/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import axios from "axios"
import { BASE_URL } from "../lib/config"

const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"]
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function CalendarWidget() {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [activityDays, setActivityDays] = useState<Set<number>>(new Set())

  const todayDate = today.getDate()
  const todayMonth = today.getMonth()
  const todayYear = today.getFullYear()

  const isCurrentMonth = viewMonth === todayMonth && viewYear === todayYear

  useEffect(() => {
    let cancelled = false

    const fetchMonthActivity = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/calendar/month`, {
          params: {
            year: viewYear,
            month: viewMonth + 1,
          },
          withCredentials: true,
        })

        if (cancelled) return
        const submittedDays = Array.isArray(response.data?.submittedDays)
          ? response.data.submittedDays
          : []
        setActivityDays(new Set(submittedDays))
      } catch {
        if (!cancelled) setActivityDays(new Set())
      }
    }

    fetchMonthActivity()
    return () => {
      cancelled = true
    }
  }, [viewMonth, viewYear])

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

  const goToToday = () => {
    if (!isCurrentMonth) {
      setViewMonth(todayMonth)
      setViewYear(todayYear)
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
          <button
            onClick={goToToday}
            disabled={isCurrentMonth}
            className={cn(
              "text-xs ml-1 transition-colors",
              isCurrentMonth
                ? "text-emerald-500"
                : "text-emerald-400 hover:text-emerald-300",
              isCurrentMonth && "opacity-70 cursor-default"
            )}
            aria-label={isCurrentMonth ? "Viewing current month" : "Go to current month"}
          >
            {isCurrentMonth ? "Viewing today" : "Go to today"}
          </button>
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

      </CardContent>
    </Card>
  )
}
