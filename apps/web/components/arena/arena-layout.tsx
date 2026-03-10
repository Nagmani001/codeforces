"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Code2, Moon, Sun, List, User, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@repo/ui/components/button"
import type { ProblemDetail, TestCase } from "../../lib/temp";
import { ProblemDescription } from "./problem-description"
import { CodeEditor } from "./code-editor"
import { TestCasesPanel } from "./test-cases-panel"
import { ProblemListDrawer } from "./problem-list-drawer"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu"
import axios from "axios"
import { BASE_URL } from "../../lib/config"
import { processJudge0Response } from "../../lib/utils"
import { useRouter } from "next/navigation"
import { fetchEventSource } from "@microsoft/fetch-event-source"
import { authClient } from "../../lib/auth"

type Language = "CPP" | "PYTHON" | "JAVA" | "JAVASCRIPT" | "TYPESCRIPT" | "GO" | "RUST";

export function ArenaLayout({ problem, problemIdList, index, user }: { problem: ProblemDetail, problemIdList: string[], index: number, user: any | undefined }) {
  const { theme, setTheme } = useTheme()
  const [isJudge0, setIsjudge0] = useState(true);
  const [language, setLanguage] = useState<Language>("CPP")
  const [code, setCode] = useState(problem.starterCode.CPP)
  const [testCases, setTestCases] = useState<TestCase[]>(problem.testCases)
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter();


  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
    setCode(problem.starterCode[newLang])
  }

  async function handleRunFor(type: "submit" | "run") {
    setIsRunning(true)
    setActiveTab("result")

    // Reset test cases to pending state
    setTestCases(problem.testCases.map(tc => ({ ...tc, status: undefined, verdict: undefined, actualOutput: undefined, stderr: undefined, compileOutput: undefined, time: undefined, memory: undefined })))

    const submissionObj = {
      problemId: problem.id,
      code,
      language,
      type,
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/execute/execute`, submissionObj, {
        withCredentials: true
      });

      const { mode, submissionId } = response.data;

      if (mode === "judge0") {
        setIsjudge0(true);
        // ---- Judge0 polling path ----
        const judge0Data = response.data.judge0;
        let actualTokens = "";
        judge0Data.forEach((x: any) => {
          actualTokens += `,${x.token}`
        });

        try {
          const poolResponse: any = await new Promise((resolve) => {
            const interval = setInterval(async () => {
              const result = await axios.get(
                `${BASE_URL}/api/execute/submission?tokens=${actualTokens.substring(1)}&type=${type}&submissionId=${submissionId}`,
                { withCredentials: true }
              );
              const arr = result.data.judge0Response.submissions;
              const pending = arr.find((x: any) => x.status.id === 1 || x.status.id === 2);
              if (!pending) {
                resolve(arr);
                setIsRunning(false)
                clearInterval(interval);
              }
            }, 1300);
          });
          const processResponse = processJudge0Response(poolResponse, problem.testCases);
          setTestCases(processResponse);
        } catch (err) {
          console.error("polling error", err);
          setIsRunning(false);
        }
      } else if (mode === "isolate") {
        setIsjudge0(false);
        // ---- Isolate SSE path ----
        await fetchEventSource(`${BASE_URL}/api/execute/stream/${submissionId}`, {
          credentials: "include",
          onmessage(ev) {
            const event = JSON.parse(ev.data);

            if (event.type === "testcase") {
              const idx = event.testCaseNumber - 1;
              setTestCases(prev => prev.map((tc, i) => {
                if (i !== idx) return tc;
                const verdictMap: Record<string, any> = {
                  ACCEPTED: "accepted",
                  WRONG_ANSWER: "wrong_answer",
                  TIME_LIMIT_EXCEEDED: "tle",
                  MEMORY_LIMIT_EXCEEDED: "tle",
                  RUNTIME_ERROR: "runtime_error",
                  COMPILATION_ERROR: "compilation_error",
                };
                return {
                  ...tc,
                  verdict: verdictMap[event.verdict] || "internal_error",
                  status: event.verdict === "ACCEPTED" ? "passed" as const : "failed" as const,
                  actualOutput: event.stdout,
                  stderr: event.stderr,
                  time: event.time != null ? String(event.time) : undefined,
                  memory: event.memory,
                };
              }));
            } else if (event.type === "done" || event.type === "error") {
              if (event.compileOutput) {
                setTestCases(prev => prev.map(tc => ({
                  ...tc,
                  verdict: "compilation_error" as const,
                  status: "failed" as const,
                  compileOutput: event.compileOutput,
                })));
              }
              setIsRunning(false);
            }
          },
          onerror(err) {
            console.error("SSE error:", err);
            setIsRunning(false);
            throw err; // stop retrying
          },
        });
      }
    } catch (err) {
      console.error("execution error", err);
      setIsRunning(false);
    }
  }

  const handleRun = async () => {
    await handleRunFor("run");
  }

  const handleSubmit = async () => {
    await handleRunFor("submit");
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Navbar */}
      <header className="flex h-12 items-center border-b px-4">
        {/* Left section */}
        <div className="flex items-center gap-2 flex-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDrawerOpen(true)}>
            <List className="h-4 w-4" />
          </Button>
          <Link href="/problems" className="flex items-center gap-2 font-semibold">
            <Code2 className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline">CodeArena</span>
          </Link>
          <div className="ml-4 flex items-center gap-1">
            <Button onClick={() => {
              router.push(`/arena/${problemIdList[index - 1] ? problemIdList[index - 1] : problemIdList[index]}`)
            }} variant="ghost" size="icon" className="h-8 w-8" disabled={problem.id === "1"}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              {problem.title}
            </span>
            <Button onClick={() => {
              router.push(`/arena/${problemIdList[index + 1] ? problemIdList[index + 1] : problemIdList[index]}`)
            }} variant="ghost" size="icon" className="h-8 w-8" disabled={problem.id === "15"}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Center section - Run & Submit */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRun} disabled={isRunning}>
            {isRunning ? "Running..." : "Run"}
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isRunning}>
            {isRunning ? "Submitting..." : "Submit"}
          </Button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {user.image ?
                    <img
                      src={user.image}
                      alt="Profile"
                      className="h-full w-full rounded-full object-cover"
                    />
                    : user.name[0].toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={async () => {
                  await authClient.signOut();
                  router.push("/signin");
                }} variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - Problem Description */}
          <ResizablePanel defaultSize={50} minSize={25}>
            <ProblemDescription problem={problem} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Code Editor + Test Cases */}
          <ResizablePanel defaultSize={50} minSize={35}>
            <ResizablePanelGroup direction="vertical">
              {/* Code Editor */}
              <ResizablePanel defaultSize={60} minSize={30}>
                <CodeEditor
                  code={code}
                  onChange={setCode}
                  starterCode={problem.starterCode}
                  language={language}
                  onLanguageChange={handleLanguageChange}
                />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Test Cases */}
              <ResizablePanel defaultSize={40} minSize={20}>
                <TestCasesPanel
                  testCases={testCases}
                  isJudge0={isJudge0}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  isRunning={isRunning}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <ProblemListDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        currentProblemId={problem.id}
      />
    </div>
  )
}
