"use client"

import { CheckCircle2, XCircle, Loader2, Clock, AlertTriangle, ServerCrash, Terminal } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { cn } from "@repo/ui/lib/utils";
import { useState } from "react"
import type { TestCase, TestCaseVerdict } from "../../lib/temp";

interface TestCasesPanelProps {
  testCases: TestCase[]
  activeTab: "testcase" | "result"
  onTabChange: (tab: "testcase" | "result") => void
  isRunning: boolean
}

function verdictIcon(verdict?: TestCaseVerdict, status?: TestCase["status"]) {
  switch (verdict) {
    case "accepted":
      return <CheckCircle2 className="h-3 w-3 text-green-500" />
    case "wrong_answer":
      return <XCircle className="h-3 w-3 text-destructive" />
    case "tle":
      return <Clock className="h-3 w-3 text-yellow-500" />
    case "compilation_error":
      return <Terminal className="h-3 w-3 text-destructive" />
    case "runtime_error":
      return <AlertTriangle className="h-3 w-3 text-destructive" />
    case "internal_error":
      return <ServerCrash className="h-3 w-3 text-muted-foreground" />
    default:
      if (status === "passed") return <CheckCircle2 className="h-3 w-3 text-green-500" />
      if (status === "failed") return <XCircle className="h-3 w-3 text-destructive" />
      return null
  }
}

function verdictLabel(verdict?: TestCaseVerdict): string {
  switch (verdict) {
    case "accepted": return "Accepted"
    case "wrong_answer": return "Wrong Answer"
    case "tle": return "Time Limit Exceeded"
    case "compilation_error": return "Compilation Error"
    case "runtime_error": return "Runtime Error"
    case "internal_error": return "Internal Error"
    default: return ""
  }
}

function summaryColor(verdict?: TestCaseVerdict): string {
  switch (verdict) {
    case "accepted": return "text-green-500"
    case "tle": return "text-yellow-500"
    case "internal_error": return "text-muted-foreground"
    default: return "text-destructive"
  }
}

export function TestCasesPanel({ testCases, activeTab, onTabChange, isRunning }: TestCasesPanelProps) {
  const [selectedCase, setSelectedCase] = useState(0)

  const hasResults = testCases.some((tc) => tc.verdict || tc.status)
  const allAccepted = hasResults && testCases.every((tc) => tc.verdict === "accepted" || tc.status === "passed")
  const passedCount = testCases.filter((tc) => tc.verdict === "accepted" || tc.status === "passed").length

  // Check if it's a compilation error (same for all test cases)
  const isCompileError = hasResults && testCases[0]?.verdict === "compilation_error"

  // Find the first non-accepted verdict for summary display
  const firstFailure = testCases.find((tc) => tc.verdict && tc.verdict !== "accepted")

  const selected = testCases[selectedCase]!

  return (
    <div className="flex h-full flex-col bg-background">
      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as "testcase" | "result")}
        className="flex h-full flex-col"
      >
        <div className="border-b px-4">
          <TabsList className="h-10 bg-transparent p-0">
            <TabsTrigger
              value="testcase"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Testcase
            </TabsTrigger>
            <TabsTrigger
              value="result"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
            >
              Result
              {isRunning && <Loader2 className="h-3 w-3 animate-spin" />}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="testcase" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Test Case Selector */}
              <div className="flex gap-2">
                {testCases.map((tc, i) => (
                  <button
                    key={tc.id}
                    onClick={() => setSelectedCase(i)}
                    className={cn(
                      "px-3 py-1 text-sm rounded-md transition-colors",
                      selectedCase === i
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    Case {i + 1}
                  </button>
                ))}
              </div>

              {/* Selected Test Case */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Input</label>
                  <div className="mt-1 rounded-md bg-muted p-3 font-mono text-sm">
                    <pre className="whitespace-pre-wrap">{selected.input}</pre>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Expected Output</label>
                  <div className="mt-1 rounded-md bg-muted p-3 font-mono text-sm">
                    <pre className="whitespace-pre-wrap">{selected.expectedOutput}</pre>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="result" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {isRunning ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Running tests...</span>
                </div>
              ) : hasResults ? (
                <>
                  {/* Summary */}
                  {isCompileError ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                        <Terminal className="h-5 w-5" />
                        Compilation Error
                      </div>
                      <div className="rounded-md bg-muted p-3 font-mono text-sm text-destructive">
                        <pre className="whitespace-pre-wrap">{selected.compileOutput || "Compilation failed"}</pre>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={cn(
                          "flex items-center gap-2 text-sm font-medium",
                          allAccepted ? "text-green-500" : summaryColor(firstFailure?.verdict),
                        )}
                      >
                        {allAccepted ? (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            Accepted
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5" />
                            <span>
                              {passedCount}/{testCases.length} test cases passed
                              {firstFailure?.verdict && (
                                <span className="ml-1">
                                  &middot; {verdictLabel(firstFailure.verdict)}
                                </span>
                              )}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Runtime/memory info */}
                      {selected.time && (
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Runtime: {selected.time}s</span>
                          {selected.memory && <span>Memory: {selected.memory} KB</span>}
                        </div>
                      )}

                      {/* Test Case Results */}
                      <div className="flex gap-2">
                        {testCases.map((tc, i) => (
                          <button
                            key={tc.id}
                            onClick={() => setSelectedCase(i)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1 text-sm rounded-md transition-colors",
                              selectedCase === i
                                ? "bg-secondary text-secondary-foreground"
                                : "text-muted-foreground hover:bg-muted",
                            )}
                          >
                            {verdictIcon(tc.verdict, tc.status)}
                            Case {i + 1}
                          </button>
                        ))}
                      </div>

                      {/* Result Details */}
                      <div className="space-y-3">
                        {/* Per-case verdict label */}
                        {selected.verdict && selected.verdict !== "accepted" && (
                          <div className={cn("text-xs font-medium", summaryColor(selected.verdict))}>
                            {verdictLabel(selected.verdict)}
                          </div>
                        )}

                        {/* TLE message */}
                        {selected.verdict === "tle" && (
                          <div className="rounded-md bg-yellow-500/10 border border-yellow-500/20 p-3 text-sm text-yellow-600 dark:text-yellow-400">
                            Your code exceeded the time limit. Try optimizing your solution.
                          </div>
                        )}

                        {/* Runtime error: show stderr */}
                        {selected.verdict === "runtime_error" && selected.stderr && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Error</label>
                            <div className="mt-1 rounded-md bg-destructive/10 border border-destructive/20 p-3 font-mono text-sm text-destructive">
                              <pre className="whitespace-pre-wrap">{selected.stderr}</pre>
                            </div>
                          </div>
                        )}

                        {/* Internal error */}
                        {selected.verdict === "internal_error" && (
                          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                            Judge encountered an internal error. Please try again.
                          </div>
                        )}

                        {/* Input / Output / Expected — show for accepted, wrong_answer, and fallback */}
                        {selected.verdict !== "internal_error" && (
                          <>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Input</label>
                              <div className="mt-1 rounded-md bg-muted p-3 font-mono text-sm">
                                <pre className="whitespace-pre-wrap">{selected.input}</pre>
                              </div>
                            </div>
                            {selected.actualOutput !== undefined && (
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Output</label>
                                <div className="mt-1 rounded-md bg-muted p-3 font-mono text-sm">
                                  <pre className="whitespace-pre-wrap">{selected.actualOutput || "(no output)"}</pre>
                                </div>
                              </div>
                            )}
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Expected</label>
                              <div className="mt-1 rounded-md bg-muted p-3 font-mono text-sm">
                                <pre className="whitespace-pre-wrap">{selected.expectedOutput}</pre>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Run your code to see results here.</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
