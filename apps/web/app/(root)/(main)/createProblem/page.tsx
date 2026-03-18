"use client"

import { useState, useEffect } from "react"
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Badge } from "@repo/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { Textarea } from "@repo/ui/components/textarea";
import { X, Plus, Trash2, Eye, EyeOff, Pencil, Lock, Loader2 } from "lucide-react"
import { Navbar } from "../../../../components/navbar"
import { MarkdownEditor } from "../../../../components/markdown-editor";
import axios from "axios";
import { BASE_URL } from "../../../../lib/config";
import { toast } from "react-hot-toast";
import { createProblemSchema } from "@repo/common/zodTypes";
import { useRouter } from "next/navigation";


interface ProblemTag {
  id: string
  title: string
  fixed: boolean
}

interface TestCase {
  id: string
  input: string
  output: string
}

interface VisibleTestCase extends TestCase {
  explanation?: string
}

export default function CreateProblemPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [problemType, setProblemType] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [constraints, setConstraints] = useState<string[]>([""])
  const [cpuTimeLimit, setCpuTimeLimit] = useState("")
  const [cpuTimeUnit, setCpuTimeUnit] = useState<"s" | "ms">("s")
  const [memoryLimit, setMemoryLimit] = useState("")
  const [memoryUnit, setMemoryUnit] = useState<"kb" | "mb">("mb")
  const [visibleTestCases, setVisibleTestCases] = useState<VisibleTestCase[]>([{ id: "1", input: "", output: "", explanation: "" }])
  const [hiddenTestCases, setHiddenTestCases] = useState<TestCase[]>([{ id: "1", input: "", output: "" }])

  // Tags state
  const [tags, setTags] = useState<ProblemTag[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(true)
  const [newTagInput, setNewTagInput] = useState("")
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editingTagValue, setEditingTagValue] = useState("")

  // Form submission state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch tags from backend on mount
  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      setIsLoadingTags(true)
      const response = await fetch(`${BASE_URL}/api/tags/getAll`, {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        // Backend returns { allTags: [...] } with full tag objects
        setTags(data.allTags || [])
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error)
    } finally {
      setIsLoadingTags(false)
    }
  }

  const addTag = async () => {
    const trimmedTag = newTagInput.trim()
    if (!trimmedTag || tags.some(t => t.title === trimmedTag)) return

    try {
      setIsAddingTag(true)
      const response = await fetch(`${BASE_URL}/api/tags/createTag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tag: trimmedTag })
      })

      if (response.ok) {
        // Refresh tags from backend to get the new tag with its ID
        await fetchTags()
        setSelectedTags((prev) => [...prev, trimmedTag])
        setNewTagInput("")
      }
    } catch (error) {
      console.error("Failed to create tag:", error)
    } finally {
      setIsAddingTag(false)
    }
  }

  const updateTag = async (tagId: string) => {
    const trimmedValue = editingTagValue.trim()
    if (!trimmedValue) return

    const tag = tags.find(t => t.id === tagId)
    if (!tag || tag.fixed) return

    try {
      const response = await fetch(`${BASE_URL}/api/tags/updateTag/${tagId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tag: trimmedValue })
      })

      if (response.ok) {
        // Update selected tags if the old title was selected
        if (selectedTags.includes(tag.title)) {
          setSelectedTags(prev => prev.map(t => t === tag.title ? trimmedValue : t))
        }
        await fetchTags()
      }
    } catch (error) {
      console.error("Failed to update tag:", error)
    } finally {
      setEditingTagId(null)
      setEditingTagValue("")
    }
  }

  const deleteTag = async (tagId: string) => {
    const tag = tags.find(t => t.id === tagId)
    if (!tag || tag.fixed) return

    try {
      const response = await fetch(`${BASE_URL}/api/tags/deleteTag/${tagId}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (response.ok) {
        // Remove from selected tags
        setSelectedTags(prev => prev.filter(t => t !== tag.title))
        await fetchTags()
      }
    } catch (error) {
      console.error("Failed to delete tag:", error)
    }
  }

  const startEditing = (tag: ProblemTag) => {
    if (tag.fixed) return
    setEditingTagId(tag.id)
    setEditingTagValue(tag.title)
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, tagId: string) => {
    if (e.key === "Enter") {
      e.preventDefault()
      updateTag(tagId)
    } else if (e.key === "Escape") {
      setEditingTagId(null)
      setEditingTagValue("")
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const addTestCase = (type: "visible" | "hidden") => {
    if (type === "visible") {
      const newCase: VisibleTestCase = {
        id: Date.now().toString(),
        input: "",
        output: "",
        explanation: "",
      }
      setVisibleTestCases((prev) => [...prev, newCase])
    } else {
      const newCase: TestCase = {
        id: Date.now().toString(),
        input: "",
        output: "",
      }
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

  const updateTestCase = (type: "visible" | "hidden", id: string, field: "input" | "output" | "explanation", value: string) => {
    if (type === "visible") {
      setVisibleTestCases((prev) => prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)))
    } else {
      setHiddenTestCases((prev) => prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)))
    }
  }

  const addConstraint = () => {
    setConstraints((prev) => [...prev, ""])
  }

  const removeConstraint = (index: number) => {
    setConstraints((prev) => prev.filter((_, i) => i !== index))
  }

  const updateConstraint = (index: number, value: string) => {
    setConstraints((prev) => prev.map((c, i) => (i === index ? value : c)))
  }

  const handleSubmit = async () => {
    setErrors({})

    // Convert cpuTimeLimit to milliseconds (number)
    const cpuTimeLimitMs = cpuTimeUnit === "s"
      ? Number.parseFloat(cpuTimeLimit) * 1000
      : Number.parseFloat(cpuTimeLimit)

    // Convert memoryLimit to KB (number)
    const memoryLimitKb = memoryUnit === "mb"
      ? Number.parseFloat(memoryLimit) * 1024
      : Number.parseFloat(memoryLimit)

    // Build tags array with the format expected by schema
    const selectedTagObjects = tags
      .filter(t => selectedTags.includes(t.title))
      .map(t => ({ title: t.title, fixed: t.fixed }))

    const problemData = {
      title,
      description,
      problemType: problemType.toUpperCase() as "EASY" | "MEDIUM" | "HARD",
      tags: selectedTagObjects,
      constraints: constraints.filter(c => c.trim() !== ""),
      cpuTimeLimit: cpuTimeLimitMs,
      memoryTimeLimit: memoryLimitKb,
      visibleTestCases: visibleTestCases.map(({ input, output }) => ({
        input,
        output,
      })),
      hiddenTestCases: hiddenTestCases.map(({ input, output }) => ({ input, output })),
    }

    // Frontend validation using Zod
    const parsedResult = createProblemSchema.safeParse(problemData)

    if (!parsedResult.success) {
      const fieldErrors: Record<string, string> = {}
      const zodErrors = JSON.parse(parsedResult.error.message)
      zodErrors.forEach((err: { path: string[], message: string }) => {
        const fieldPath = err.path.join(".")
        fieldErrors[fieldPath] = err.message
      })
      setErrors(fieldErrors)
      toast.error("Please fix the validation errors")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await axios.post(
        `${BASE_URL}/api/admin/problems/createProblem`,
        problemData,
        { withCredentials: true }
      )

      if (response.status === 201) {
        toast.success("Problem created successfully!")
        router.push("/problems")
      }
    } catch (err: any) {
      console.error("Failed to create problem:", err)
      if (err.response?.status === 401) {
        toast.error("You must be logged in to create problems")
      } else if (err.response?.status === 403) {
        toast.error("Only admins can create problems")
      } else if (err.response?.status === 400) {
        toast.error("Invalid input data. Please check your form.")
      } else {
        toast.error("Failed to create problem. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={null} />
      <main className="container mx-auto py-8 px-4 max-w-6xl">
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
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
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
                {errors.problemType && <p className="text-sm text-destructive">{errors.problemType}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Select relevant tags for the problem. Fixed tags cannot be modified or deleted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingTags ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading tags...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className="group relative">
                      {editingTagId === tag.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editingTagValue}
                            onChange={(e) => setEditingTagValue(e.target.value)}
                            onKeyDown={(e) => handleEditKeyDown(e, tag.id)}
                            onBlur={() => updateTag(tag.id)}
                            className="h-7 w-32 text-sm"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <Badge
                          variant={selectedTags.includes(tag.title) ? "default" : "outline"}
                          className={`cursor-pointer transition-colors pr-1 ${!tag.fixed ? "border-dashed" : ""}`}
                          onClick={() => toggleTag(tag.title)}
                        >
                          {tag.fixed && <Lock className="mr-1 h-3 w-3 opacity-50" />}
                          {tag.title}
                          {selectedTags.includes(tag.title) && <X className="ml-1 h-3 w-3" />}
                          {!tag.fixed && (
                            <span className="ml-1 hidden group-hover:inline-flex gap-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEditing(tag)
                                }}
                                className="p-0.5 hover:bg-muted rounded"
                                title="Edit tag"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteTag(tag.id)
                                }}
                                className="p-0.5 hover:bg-destructive/20 rounded text-destructive"
                                title="Delete tag"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </span>
                          )}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new tag..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="flex-1"
                  disabled={isAddingTag}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={isAddingTag || !newTagInput.trim() || tags.some(t => t.title === newTagInput.trim())}
                >
                  {isAddingTag ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Add Tag
                </Button>
              </div>
              {selectedTags.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedTags.length} tag{selectedTags.length !== 1 ? "s" : ""} selected
                </p>
              )}
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
              {errors.description && <p className="text-sm text-destructive mt-2">{errors.description}</p>}
            </CardContent>
          </Card>

          {/* Time and Memory Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Time and Memory Limits</CardTitle>
              <CardDescription>Set execution limits for the problem</CardDescription>
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
                  {errors.cpuTimeLimit && <p className="text-sm text-destructive">{errors.cpuTimeLimit}</p>}
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
                  {errors.memoryTimeLimit && <p className="text-sm text-destructive">{errors.memoryTimeLimit}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Problem Constraints */}
          <Card>
            <CardHeader>
              <CardTitle>Problem Constraints</CardTitle>
              <CardDescription>Define constraints for the problem (e.g., input ranges, array sizes)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {constraints.map((constraint, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="e.g., 1 <= n <= 10^4"
                    value={constraint}
                    onChange={(e) => updateConstraint(index, e.target.value)}
                    className="flex-1"
                  />
                  {constraints.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeConstraint(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addConstraint} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Constraint
              </Button>
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
                    <VisibleTestCaseEditor
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
            <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Problem...
                </>
              ) : (
                "Create Problem"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

function VisibleTestCaseEditor({
  index,
  testCase,
  onUpdate,
  onRemove,
  canRemove,
}: {
  index: number
  testCase: VisibleTestCase
  onUpdate: (field: "input" | "output" | "explanation", value: string) => void
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
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Explanation (Optional)</Label>
        <Textarea
          placeholder="e.g., Because nums[0] + nums[1] == 9, we return [0, 1]."
          value={testCase.explanation || ""}
          onChange={(e) => onUpdate("explanation", e.target.value)}
          className="text-sm min-h-[60px] resize-none"
        />
      </div>
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
