
import { Card, CardContent } from "@repo/ui/components/card"
import { cn } from "@repo/ui/lib/utils"
import { Check } from "lucide-react"
import { ProblemStats } from "@repo/common/types";

export function ProgressWidget({ easy, medium, hard }: ProblemStats) {

  const totalSolved = easy.solved + medium.solved + hard.solved
  const totalProblems = easy.total + medium.total + hard.total
  const attempting = 2

  // Gauge parameters
  const size = 180
  const center = size / 2
  const radius = 70
  const strokeWidth = 14
  const circumference = 2 * Math.PI * radius

  // 270-degree arc (open at bottom)
  const totalArc = circumference * 0.75

  // Segment lengths proportional to each difficulty's total problems
  const easyArc = (easy.total / totalProblems) * totalArc
  const hardArc = (hard.total / totalProblems) * totalArc
  const mediumArc = (medium.total / totalProblems) * totalArc

  // Rotation offsets — gauge starts at 135° (bottom-left)
  const baseRotation = 135
  const easyRotation = baseRotation
  const hardRotation = baseRotation + (easyArc / circumference) * 360
  const mediumRotation = hardRotation + (hardArc / circumference) * 360

  const difficulties = [
    {
      label: "Easy",
      solved: easy.solved,
      total: easy.total,
      borderColor: "border-l-amber-500",
      textColor: "text-amber-500",
    },
    {
      label: "Med.",
      solved: medium.solved,
      total: medium.total,
      borderColor: "border-l-red-500",
      textColor: "text-red-500",
    },
    {
      label: "Hard",
      solved: hard.solved,
      total: hard.total,
      borderColor: "border-l-teal-500",
      textColor: "text-teal-500",
    },
  ]

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          {/* Gauge */}
          <div className="flex-shrink-0 w-full sm:w-auto flex justify-center">
            <div className="relative scale-90 sm:scale-100">
              <svg className="w-full max-w-[180px] h-auto" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background track */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${totalArc} ${circumference - totalArc}`}
                  strokeLinecap="round"
                  className="text-muted/30"
                  transform={`rotate(${baseRotation}, ${center}, ${center})`}
                />

                {/* Easy segment (green) */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${easyArc} ${circumference - easyArc}`}
                  strokeLinecap="butt"
                  transform={`rotate(${easyRotation}, ${center}, ${center})`}
                />

                {/* Hard segment (red) */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${hardArc} ${circumference - hardArc}`}
                  strokeLinecap="butt"
                  transform={`rotate(${hardRotation}, ${center}, ${center})`}
                />

                {/* Medium segment (amber) */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${mediumArc} ${circumference - mediumArc}`}
                  strokeLinecap="butt"
                  transform={`rotate(${mediumRotation}, ${center}, ${center})`}
                />
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div>
                  <span className="text-3xl font-bold leading-none">{totalSolved}</span>
                  <span className="text-sm text-muted-foreground">/{totalProblems}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-emerald-500">
                  <Check className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">Solved</span>
                </div>
              </div>
            </div>

            {/* Attempting indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{attempting}</span> Attempting
              </span>
            </div>
          </div>

          {/* Difficulty cards */}
          <div className="flex flex-col gap-2.5 min-w-0 flex-1">
            {difficulties.map((d) => (
              <div
                key={d.label}
                className={cn(
                  "border-l-[3px] rounded-r-md bg-muted/15 px-3 py-2.5",
                  d.borderColor
                )}
              >
                <div className="text-[11px] text-muted-foreground font-medium">{d.label}</div>
                <div className="text-base font-bold mt-0.5">
                  <span className={d.textColor}>{d.solved}</span>
                  <span className="text-muted-foreground font-normal text-sm">/{d.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
