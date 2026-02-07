"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Code2, Moon, Sun, List } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@repo/ui/components/button"
import type { ProblemDetail, TestCase } from "../../lib/temp";
import { ProblemDescription } from "./problem-description"
import { CodeEditor } from "./code-editor"
import { TestCasesPanel } from "./test-cases-panel"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable"
import axios from "axios"
import { BASE_URL } from "../../lib/config"
import { processJudge0Response } from "../../lib/utils"

type Language = "CPP" | "PYTHON" | "JAVA" | "JAVASCRIPT" | "TYPESCRIPT" | "GO" | "RUST";

export function ArenaLayout({ problem }: { problem: ProblemDetail }) {
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState<Language>("CPP")
  const [code, setCode] = useState(problem.starterCode.CPP)
  const [testCases, setTestCases] = useState<TestCase[]>(problem.testCases)
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase")

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
    setCode(problem.starterCode[newLang])
  }

  async function handleRunFor(type: "submit" | "run") {
    setIsRunning(true)
    setActiveTab("result")

    const submissionObj = {
      problemId: problem.id,
      code,
      language,
    };

    try {
      const tokens = await axios.post(`${BASE_URL}/api/judge0/submit`, submissionObj, {
        withCredentials: true
      });

      let actualTokens = "";
      tokens.data.forEach((x: any) => {
        actualTokens += `,${x.token}`
      });
      try {
        const poolResponse: any = await new Promise(async (resolve, regect) => {
          const interval = setInterval(async () => {
            const result = await axios.get(`${BASE_URL}/api/judge0/submission?tokens=${actualTokens.substring(1)}`, { withCredentials: true });
            const arr = result.data.judge0Response.submissions;
            const status = arr.find((x: any) => {
              if (x.status.id == 1 || x.status.id == 2) {
                return true;
              }
            });
            if (!status) {
              resolve(arr);
              setIsRunning(false)
              clearInterval(interval);
            }
          }, 1300);
        });
        const processResponse = processJudge0Response(poolResponse, problem.testCases);
        setTestCases(processResponse);
      } catch (err) {
      }
    } catch (err) {
      console.log("error", err);
    }
  }

  const handleRun = async () => {
    setIsRunning(true)
    setActiveTab("result")

    const submissionObj = {
      problemId: problem.id,
      code,
      language,
    };

    try {
      const tokens = await axios.post(`${BASE_URL}/api/judge0/submit`, submissionObj, {
        withCredentials: true
      });

      let actualTokens = "";
      tokens.data.forEach((x: any) => {
        actualTokens += `,${x.token}`
      });
      try {
        const poolResponse: any = await new Promise(async (resolve, regect) => {
          const interval = setInterval(async () => {
            const result = await axios.get(`${BASE_URL}/api/judge0/submission?tokens=${actualTokens.substring(1)}`, { withCredentials: true });
            const arr = result.data.judge0Response.submissions;
            const status = arr.find((x: any) => {
              if (x.status.id == 1 || x.status.id == 2) {
                return true;
              }
            });
            if (!status) {
              resolve(arr);
              setIsRunning(false)
              clearInterval(interval);
            }
          }, 1300);
        });
        const processResponse = processJudge0Response(poolResponse, problem.testCases);
        setTestCases(processResponse);
      } catch (err) {
      }
    } catch (err) {
      console.log("error", err);
    }
  }

  const handleSubmit = () => {
    setIsRunning(true)
    setActiveTab("result")
    // Simulate submission
    setTimeout(() => {
      setTestCases((prev) =>
        prev.map((tc) => ({
          ...tc,
          actualOutput: tc.expectedOutput,
          status: "passed",
        })),
      )
      setIsRunning(false)
    }, 2000)
  }

  const prevProblemId = String(Math.max(1, Number(problem.id) - 1))
  const nextProblemId = String(Math.min(15, Number(problem.id) + 1))

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Navbar */}
      <header className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Link href="/problems">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <List className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/problems" className="flex items-center gap-2 font-semibold">
            <Code2 className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline">CodeArena</span>
          </Link>
          <div className="ml-4 flex items-center gap-1">
            <Link href={`/ arena / ${prevProblemId}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={problem.id === "1"}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <span className="text-sm font-medium px-2">
              {problem.title}
            </span>
            <Link href={`/ arena / ${nextProblemId}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={problem.id === "15"}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRun} disabled={isRunning}>
            {isRunning ? "Running..." : "Run"}
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isRunning}>
            {isRunning ? "Submitting..." : "Submit"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - Problem Description */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <ProblemDescription problem={problem} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Code Editor + Test Cases */}
          <ResizablePanel defaultSize={60} minSize={35}>
            <ResizablePanelGroup direction="vertical">
              {/* Code Editor */}
              <ResizablePanel defaultSize={60} minSize={30}>
                <CodeEditor
                  code={code}
                  onChange={setCode}
                  language={language}
                  onLanguageChange={handleLanguageChange}
                />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Test Cases */}
              <ResizablePanel defaultSize={40} minSize={20}>
                <TestCasesPanel
                  testCases={testCases}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  isRunning={isRunning}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
