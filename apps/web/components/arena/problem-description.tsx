"use client"

import { Badge } from "@repo/ui/components/badge";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/utils"
import { ProblemDetail } from "../../lib/temp";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const difficultyColors = {
  EASY: "text-accent",
  MEDIUM: "text-chart-3",
  HARD: "text-destructive",
}

export function ProblemDescription({ problem }: { problem: ProblemDetail }) {
  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="description" className="flex h-full flex-col">
        <div className="border-b px-4">
          <TabsList className="h-10 bg-transparent p-0">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Submissions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="description" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Title and Difficulty */}
              <div>
                <h1 className="text-xl font-semibold">
                  {problem.title}
                </h1>
                <Badge variant="secondary" className={cn("mt-2", difficultyColors[problem.problemType])}>
                  {problem.problemType == "HARD" ? "Hard" : problem.problemType == "EASY" ? "Easy" : "Medium"}
                </Badge>
              </div>

              {/* Description */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {problem.description}
                </ReactMarkdown>
              </div>

              {/* Examples */}
              <div className="space-y-3">
                {problem.examples.map((example, i) => (
                  <div key={i} className="space-y-2">
                    <h3 className="font-medium text-sm">Example {i + 1}:</h3>
                    <div className="bg-muted rounded-md p-3 space-y-1 font-mono text-sm">
                      <div>
                        <span className="text-muted-foreground">Input: </span>
                        {example.input}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Output: </span>
                        {example.output}
                      </div>
                      {example.explanation && (
                        <div className="text-muted-foreground pt-1">
                          <span className="font-sans">Explanation: </span>
                          <span className="font-sans">{example.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Constraints */}
              <div>
                <h3 className="font-medium text-sm mb-2">Constraints:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {problem.constraints.map((constraint, i) => (
                    <li key={i} className="font-mono">
                      {constraint}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="submissions" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
