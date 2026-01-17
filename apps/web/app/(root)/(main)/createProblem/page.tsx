"use client"

import { useState } from "react"
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Badge } from "@repo/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { Textarea } from "@repo/ui/components/textarea";
import { X, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { Navbar } from "../../../../components/navbar"
import { MarkdownEditor } from "../../../../components/markdown-editor";

const AVAILABLE_TAGS = [
  "Array",
  "Binary Search",
  "Divide and Conquer",
  "Dynamic Programming",
  "Greedy",
  "Hash Table",
  "Linked List",
  "Math",
  "Recursion",
  "Sliding Window",
  "Sorting",
  "String",
  "Trie",
  "Two Pointers",
]

interface TestCase {
  id: string
  input: string
  output: string
}

export default function CreateProblemPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [problemType, setProblemType] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [cpuTimeLimit, setCpuTimeLimit] = useState("")
  const [cpuTimeUnit, setCpuTimeUnit] = useState<"s" | "ms">("s")
  const [memoryLimit, setMemoryLimit] = useState("")
  const [memoryUnit, setMemoryUnit] = useState<"kb" | "mb">("mb")
  const [visibleTestCases, setVisibleTestCases] = useState<TestCase[]>([{ id: "1", input: "", output: "" }])
  const [hiddenTestCases, setHiddenTestCases] = useState<TestCase[]>([{ id: "1", input: "", output: "" }])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const addTestCase = (type: "visible" | "hidden") => {
    const newCase: TestCase = {
      id: Date.now().toString(),
      input: "",
      output: "",
    }
    if (type === "visible") {
      setVisibleTestCases((prev) => [...prev, newCase])
    } else {
      setHiddenTestCases((prev) => [...prev, newCase])
    }
  }

  const removeTestCase = (type: "visible" | "hidden", id: string) => {
    if (type === "visible") {
      setVisibleTestCases((prev) => prev.filter((tc) => tc.id !== id))
    } else {
      setHiddenTestCases((prev) => prev.filter((tc) => tc.id !== id))
    }
  }

  const updateTestCase = (type: "visible" | "hidden", id: string, field: "input" | "output", value: string) => {
    if (type === "visible") {
      setVisibleTestCases((prev) => prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)))
    } else {
      setHiddenTestCases((prev) => prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)))
    }
  }

  const handleSubmit = () => {
    const problemData = {
      title,
      description,
      problemType,
      tags: selectedTags,
      cpuTimeLimit: { value: Number.parseFloat(cpuTimeLimit), unit: cpuTimeUnit },
      memoryLimit: { value: Number.parseFloat(memoryLimit), unit: memoryUnit },
      visibleTestCases: visibleTestCases.map(({ input, output }) => ({ input, output })),
      hiddenTestCases: hiddenTestCases.map(({ input, output }) => ({ input, output })),
    }
    console.log("Problem Data:", problemData)
    // Here you would typically send this to your API
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create Problem</h1>
          <p className="text-muted-foreground mt-2">Define a new coding problem with test cases and constraints</p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the problem title and difficulty level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Problem Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Two Sum"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={problemType} onValueChange={setProblemType}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Select relevant tags for the problem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Problem Description</CardTitle>
              <CardDescription>Write the problem statement in Markdown format</CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownEditor value={description} onChange={setDescription} />
            </CardContent>
          </Card>

          {/* Constraints */}
          <Card>
            <CardHeader>
              <CardTitle>Constraints</CardTitle>
              <CardDescription>Set time and memory limits for the problem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpu-time">CPU Time Limit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cpu-time"
                      type="number"
                      placeholder="e.g., 2"
                      value={cpuTimeLimit}
                      onChange={(e) => setCpuTimeLimit(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={cpuTimeUnit} onValueChange={(v) => setCpuTimeUnit(v as "s" | "ms")}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="s">sec</SelectItem>
                        <SelectItem value="ms">ms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memory">Memory Limit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="memory"
                      type="number"
                      placeholder="e.g., 256"
                      value={memoryLimit}
                      onChange={(e) => setMemoryLimit(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={memoryUnit} onValueChange={(v) => setMemoryUnit(v as "kb" | "mb")}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kb">KB</SelectItem>
                        <SelectItem value="mb">MB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Cases */}
          <Card>
            <CardHeader>
              <CardTitle>Test Cases</CardTitle>
              <CardDescription>Define visible and hidden test cases for the problem</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="visible" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="visible" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Visible ({visibleTestCases.length})
                  </TabsTrigger>
                  <TabsTrigger value="hidden" className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    Hidden ({hiddenTestCases.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="visible" className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">These test cases will be shown to users as examples</p>
                  {visibleTestCases.map((testCase, index) => (
                    <TestCaseEditor
                      key={testCase.id}
                      index={index + 1}
                      testCase={testCase}
                      onUpdate={(field, value) => updateTestCase("visible", testCase.id, field, value)}
                      onRemove={() => removeTestCase("visible", testCase.id)}
                      canRemove={visibleTestCases.length > 1}
                    />
                  ))}
                  <Button variant="outline" onClick={() => addTestCase("visible")} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Visible Test Case
                  </Button>
                </TabsContent>

                <TabsContent value="hidden" className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">These test cases will be used for final evaluation</p>
                  {hiddenTestCases.map((testCase, index) => (
                    <TestCaseEditor
                      key={testCase.id}
                      index={index + 1}
                      testCase={testCase}
                      onUpdate={(field, value) => updateTestCase("hidden", testCase.id, field, value)}
                      onRemove={() => removeTestCase("hidden", testCase.id)}
                      canRemove={hiddenTestCases.length > 1}
                    />
                  ))}
                  <Button variant="outline" onClick={() => addTestCase("hidden")} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Hidden Test Case
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSubmit}>Create Problem</Button>
          </div>
        </div>
      </main>
    </div>
  )
}

function TestCaseEditor({
  index,
  testCase,
  onUpdate,
  onRemove,
  canRemove,
}: {
  index: number
  testCase: TestCase
  onUpdate: (field: "input" | "output", value: string) => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <div className="border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm text-foreground">Test Case {index}</span>
        {canRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Input</Label>
          <Textarea
            placeholder="Enter input..."
            value={testCase.input}
            onChange={(e) => onUpdate("input", e.target.value)}
            className="font-mono text-sm min-h-[100px] resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Expected Output</Label>
          <Textarea
            placeholder="Enter expected output..."
            value={testCase.output}
            onChange={(e) => onUpdate("output", e.target.value)}
            className="font-mono text-sm min-h-[100px] resize-none"
          />
        </div>
      </div>
    </div>
  )
}
