"use client"

import { useTheme } from "next-themes"
import Editor from "@monaco-editor/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Button } from "@repo/ui/components/button";
import { RotateCcw } from "lucide-react"

type Language = "cpp" | "python" | "java" | "javascript"

const languageLabels: Record<Language, string> = {
  cpp: "C++",
  python: "Python",
  java: "Java",
  javascript: "JavaScript",
}

const monacoLanguages: Record<Language, string> = {
  cpp: "cpp",
  python: "python",
  java: "java",
  javascript: "javascript",
}

interface CodeEditorProps {
  code: string
  onChange: (value: string) => void
  language: Language
  onLanguageChange: (lang: Language) => void
}

export function CodeEditor({ code, onChange, language, onLanguageChange }: CodeEditorProps) {
  const { theme } = useTheme()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <Select value={language} onValueChange={(v) => onLanguageChange(v as Language)}>
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(languageLabels) as Language[]).map((lang) => (
              <SelectItem key={lang} value={lang}>
                {languageLabels[lang]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" className="h-8 gap-1">
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={monacoLanguages[language]}
          value={code}
          onChange={(value) => onChange(value || "")}
          theme={theme === "dark" ? "vs-dark" : "light"}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Geist Mono', monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12 },
          }}
        />
      </div>
    </div>
  )
}
