"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Textarea } from "@/components/ui/textarea"
import { Play, Square, RotateCcw, Terminal, FileText, AlertCircle, CheckCircle, Clock, Zap, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"

interface ProjectFile {
  id: string
  name: string
  path: string
  content: string
  file_type: "file" | "directory"
  mime_type: string
  size_bytes: number
  created_at: string
  updated_at: string
}

interface CodeEditorProps {
  selectedFile?: ProjectFile
  projectId?: string
}

const sampleCode = {
  javascript: `// Welcome to SwiftCompiler!
console.log("Hello, World!");

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
  python: `# Welcome to SwiftCompiler!
print("Hello, World!")

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci sequence:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
  java: `// Welcome to SwiftCompiler!
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        System.out.println("Fibonacci sequence:");
        for (int i = 0; i < 10; i++) {
            System.out.println("F(" + i + ") = " + fibonacci(i));
        }
    }
    
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`,
}

export function CodeEditor({ selectedFile, projectId }: CodeEditorProps) {
  const [code, setCode] = useState(selectedFile?.content || sampleCode.javascript)
  const [input, setInput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [output, setOutput] = useState("")
  const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [executionStats, setExecutionStats] = useState<{ time?: number; memory?: number }>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  // Update code when selected file changes
  useEffect(() => {
    if (selectedFile) {
      setCode(selectedFile.content)
      setHasUnsavedChanges(false)
    }
  }, [selectedFile])

  // Track unsaved changes
  useEffect(() => {
    if (selectedFile && code !== selectedFile.content) {
      setHasUnsavedChanges(true)
    } else {
      setHasUnsavedChanges(false)
    }
  }, [code, selectedFile])

  const handleSave = async () => {
    if (!selectedFile || !projectId || !hasUnsavedChanges) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/files/${selectedFile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: code }),
      })

      if (response.ok) {
        setHasUnsavedChanges(false)
        toast({
          title: "Success",
          description: "File saved successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to save file",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save file",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getLanguageFromFile = (file: ProjectFile): string => {
    const ext = file.name.split(".").pop()?.toLowerCase()
    const langMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      go: "go",
      rs: "rust",
      php: "php",
      rb: "ruby",
      swift: "swift",
      kt: "kotlin",
      cs: "csharp",
      html: "html",
      css: "css",
    }
    return langMap[ext || ""] || "javascript"
  }

  const handleRun = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to run",
        variant: "destructive",
      })
      return
    }

    setIsRunning(true)
    setExecutionStatus("running")
    setOutput("Compiling and executing...\n")
    setExecutionStats({})

    let retryCount = 0
    const maxRetries = 3

    const executeWithRetry = async (): Promise<any> => {
      try {
        const response = await fetch("/api/compile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            language: currentLanguage,
            input,
            projectId,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        retryCount++
        if (retryCount < maxRetries) {
          setOutput((prev) => prev + `\nRetrying... (${retryCount}/${maxRetries})\n`)
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return executeWithRetry()
        }
        throw error
      }
    }

    try {
      const result = await executeWithRetry()

      if (result.success) {
        setExecutionStatus("success")
        setOutput(result.output || "Program executed successfully with no output.")
        setExecutionStats({
          time: result.executionTime,
          memory: result.memoryUsage,
        })
        toast({
          title: "Execution Successful",
          description: `Code executed in ${result.executionTime}ms`,
        })
      } else {
        setExecutionStatus("error")
        setOutput(result.error || "Unknown error occurred")
        setExecutionStats({
          time: result.executionTime,
        })
        toast({
          title: "Execution Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      setExecutionStatus("error")
      setOutput("Network error: Failed to execute code after multiple attempts")
      toast({
        title: "Network Error",
        description: "Failed to connect to compilation service",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleStop = () => {
    setIsRunning(false)
    setExecutionStatus("idle")
    setOutput((prev) => prev + "\n\nExecution stopped by user.")
  }

  const handleClear = () => {
    setOutput("")
    setInput("")
    setExecutionStatus("idle")
    setExecutionStats({})
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [code])

  const debouncedSave = useCallback(
    (content: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        if (selectedFile && projectId && content !== selectedFile.content) {
          handleSave()
        }
      }, 2000) // Auto-save after 2 seconds of inactivity
    },
    [selectedFile, projectId],
  )

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode)
      if (selectedFile && projectId) {
        debouncedSave(newCode)
      }
    },
    [selectedFile, projectId, debouncedSave],
  )

  const currentLanguage = useMemo(() => {
    if (!selectedFile) return "javascript"
    return getLanguageFromFile(selectedFile)
  }, [selectedFile])

  const codeStats = useMemo(() => {
    const lines = code.split("\n").length
    const characters = code.length
    const words = code.trim().split(/\s+/).length
    return { lines, characters, words }
  }, [code])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col">
      {/* Editor Header */}
      <div className="border-b border-border bg-background/50">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            {selectedFile ? (
              <>
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                {hasUnsavedChanges && <div className="w-2 h-2 rounded-full bg-orange-500" />}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">No file selected</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedFile && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="gap-2 bg-transparent"
              >
                {isSaving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
                {isSaving ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <ResizablePanelGroup direction="vertical" className="flex-1">
        {/* Code Editor Panel */}
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-2 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                {selectedFile && (
                  <Badge variant="outline" className="text-xs">
                    {currentLanguage.toUpperCase()}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  Lines: {codeStats.lines} | Chars: {codeStats.characters} | Words: {codeStats.words}
                </span>
                {executionStats.time && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Zap className="h-3 w-3" />
                    {executionStats.time}ms
                  </Badge>
                )}
                {executionStats.memory && (
                  <Badge variant="secondary" className="text-xs">
                    {executionStats.memory}MB
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleRun} disabled={isRunning || !selectedFile} className="gap-2">
                  {isRunning ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Running
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run
                    </>
                  )}
                </Button>
                {isRunning && (
                  <Button size="sm" variant="destructive" onClick={handleStop} className="gap-2">
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 p-4 bg-background">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="w-full h-full resize-none bg-transparent border-none outline-none font-mono text-sm leading-relaxed"
                placeholder={selectedFile ? "Start coding here..." : "Select a file to start coding..."}
                spellCheck={false}
                readOnly={!selectedFile}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Input Panel */}
        <ResizablePanel defaultSize={15} minSize={10}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-2 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span className="text-sm font-medium">Input</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setInput("")} className="gap-2 bg-transparent">
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
            </div>
            <div className="flex-1 p-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input for your program..."
                className="w-full h-full resize-none font-mono text-sm"
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Output Panel */}
        <ResizablePanel defaultSize={25} minSize={15}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-2 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span className="text-sm font-medium">Output</span>
                {executionStatus === "running" && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3 animate-spin" />
                    Running
                  </Badge>
                )}
                {executionStatus === "success" && (
                  <Badge variant="default" className="gap-1 bg-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Success
                  </Badge>
                )}
                {executionStatus === "error" && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Error
                  </Badge>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={handleClear} className="gap-2 bg-transparent">
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
                {output || 'No output yet. Select a file and click "Run" to execute your code.'}
              </pre>
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
