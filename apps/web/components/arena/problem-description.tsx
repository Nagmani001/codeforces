"use client"

import { useEffect, useState } from "react";
import { Badge } from "@repo/ui/components/badge";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/utils"
import { ProblemDetail } from "../../lib/temp";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";
import { BASE_URL } from "../../lib/config";
import { MarkdownRenderer } from "./markdown-renderer";

type Submission = {
  id: string;
  code: string | null;
  language: string;
  status: string;
  resultVerdict: string | null;
  problemId: string;
  userId: string;
};

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

        <TabsContent value="description" className="flex-1 m-0 overflow-hidden">
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
              {/*
              */}
              <MarkdownRenderer source={problem.description} />
              {/* Examples */}
              {/*
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
              */}

              {/* Constraints */}
              {/*
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
              */}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="submissions" className="flex-1 m-0 overflow-hidden">
          <SubmissionsPanel problemId={problem.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

const verdictConfig: Record<string, { label: string; className: string }> = {
  ACCEPTED: { label: "Accepted", className: "text-accent" },
  WRONG_ANSWER: { label: "Wrong Answer", className: "text-destructive" },
  TIME_LIMIT_EXCEEDED: { label: "TLE", className: "text-chart-3" },
  MEMORY_LIMIT_EXCEEDED: { label: "MLE", className: "text-chart-3" },
  RUNTIME_ERROR: { label: "Runtime Error", className: "text-destructive" },
  COMPILATION_ERROR: { label: "Compilation Error", className: "text-destructive" },
};

function SubmissionsPanel({ problemId }: { problemId: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await axios.get(`${BASE_URL}/api/submissions?problemId=${problemId}`, {
          withCredentials: true,
        });
        setSubmissions(res.data.submissions);
      } catch {
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, [problemId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Loading submissions...</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4">
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        {submissions.map((sub) => {
          const verdict = sub.resultVerdict
            ? verdictConfig[sub.resultVerdict]
            : null;

          return (
            <div
              key={sub.id}
              className="flex items-center justify-between rounded-md border bg-muted/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-sm font-medium",
                    verdict?.className ?? "text-muted-foreground"
                  )}
                >
                  {verdict?.label ?? sub.status}
                </span>
                <Badge variant="outline" className="text-xs font-mono">
                  {sub.language}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
