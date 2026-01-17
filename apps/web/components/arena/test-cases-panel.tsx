"use client"

import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { cn } from "@repo/ui/lib/utils";
import { useState } from "react"
import { TestCase } from "../../lib/temp";

interface TestCasesPanelProps {
  testCases: TestCase[]
  activeTab: "testcase" | "result"
  onTabChange: (tab: "testcase" | "result") => void
  isRunning: boolean
}

export function TestCasesPanel({ testCases, activeTab, onTabChange, isRunning }: TestCasesPanelProps) {
  const [selectedCase, setSelectedCase] = useState(0)

  const hasResults = testCases.some((tc) => tc.status)
  const allPassed = hasResults && testCases.every((tc) => tc.status === "passed")
  const passedCount = testCases.filter((tc) => tc.status === "passed").length

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
                    <pre className="whitespace-pre-wrap">{testCases[selectedCase].input}</pre>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Expected Output</label>
                  <div className="mt-1 rounded-md bg-muted p-3 font-mono text-sm">
                    <pre className="whitespace-pre-wrap">{testCases[selectedCase].expectedOutput}</pre>
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
                  <div
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium",
                      allPassed ? "text-accent" : "text-destructive",
                    )}
                  >
                    {allPassed ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Accepted
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5" />
                        {passedCount}/{testCases.length} test cases passed
                      </>
                    )}
                  </div>

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
                        {tc.status === "passed" ? (
                          <CheckCircle2 className="h-3 w-3 text-accent" />
                        ) : (
                          <XCircle className="h-3 w-3 text-destructive" />
                        )}
                        Case {i + 1}
                      </button>
                    ))}
                  </div>

                  {/* Result Details */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Input</label>
                      <div className="mt-1 rounded-md bg-muted p-3 font-mono text-sm">
                        <pre className="whitespace-pre-wrap">{testCases[selectedCase].input}</pre>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Output</label>
                      <div className="mt-1 rounded-md bg-muted p-3 font-mono text-sm">
                        <pre className="whitespace-pre-wrap">{testCases[selectedCase].actualOutput}</pre>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Expected</label>
                      <div className="mt-1 rounded-md bg-muted p-3 font-mono text-sm">
                        <pre className="whitespace-pre-wrap">{testCases[selectedCase].expectedOutput}</pre>
                      </div>
                    </div>
                  </div>
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
