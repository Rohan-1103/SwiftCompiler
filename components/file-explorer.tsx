"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import {
  Folder,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  FileText,
  Code,
  Globe,
  ImageIcon,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

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

interface FileExplorerProps {
  projectId: string
  onFileSelect?: (file: ProjectFile) => void
  selectedFileId?: string
}

export function FileExplorer({ projectId, onFileSelect, selectedFileId }: FileExplorerProps) {
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [renamingFile, setRenamingFile] = useState<ProjectFile | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // Form state
  const [newFileName, setNewFileName] = useState("")
  const [newFileType, setNewFileType] = useState<"file" | "directory">("file")
  const [renameValue, setRenameValue] = useState("")

  useEffect(() => {
    if (projectId) {
      fetchFiles()
    }
  }, [projectId])

  const fetchFiles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/projects/${projectId}/files`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch files",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch files",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFile = async () => {
    if (!newFileName.trim()) {
      toast({
        title: "Error",
        description: "File name is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFileName,
          path: newFileName,
          file_type: newFileType,
          content: newFileType === "file" ? getDefaultContent(newFileName) : "",
        }),
      })

      if (response.ok) {
        const newFile = await response.json()
        setFiles([...files, newFile])
        setIsCreateDialogOpen(false)
        setNewFileName("")
        setNewFileType("file")
        toast({
          title: "Success",
          description: `${newFileType === "file" ? "File" : "Folder"} created successfully`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to create file",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create file",
        variant: "destructive",
      })
    }
  }

  const handleRenameFile = async () => {
    if (!renamingFile || !renameValue.trim()) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/files/${renamingFile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: renameValue,
          path: renameValue,
        }),
      })

      if (response.ok) {
        const updatedFile = await response.json()
        setFiles(files.map((f) => (f.id === renamingFile.id ? updatedFile : f)))
        setIsRenameDialogOpen(false)
        setRenamingFile(null)
        setRenameValue("")
        toast({
          title: "Success",
          description: "File renamed successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to rename file",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename file",
        variant: "destructive",
      })
    }
  }

  const handleDeleteFile = async (file: ProjectFile) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/files/${file.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFiles(files.filter((f) => f.id !== file.id))
        toast({
          title: "Success",
          description: "File deleted successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to delete file",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const getDefaultContent = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    const templates: Record<string, string> = {
      js: "// JavaScript file\nconsole.log('Hello, World!');",
      ts: "// TypeScript file\nconsole.log('Hello, World!');",
      py: "# Python file\nprint('Hello, World!')",
      java: '// Java file\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      cpp: '// C++ file\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
      html: "<!DOCTYPE html>\n<html>\n<head>\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>",
      css: "/* CSS file */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}",
      md: "# Markdown File\n\nHello, World!",
    }
    return templates[ext || ""] || "// New file"
  }

  const getFileIcon = (file: ProjectFile) => {
    if (file.file_type === "directory") {
      return expandedFolders.has(file.id) ? FolderOpen : Folder
    }

    const ext = file.name.split(".").pop()?.toLowerCase()
    const iconMap: Record<string, any> = {
      js: Code,
      ts: Code,
      py: Code,
      java: Code,
      cpp: Code,
      c: Code,
      go: Code,
      rs: Code,
      php: Code,
      rb: Code,
      html: Globe,
      css: Globe,
      png: ImageIcon,
      jpg: ImageIcon,
      jpeg: ImageIcon,
      gif: ImageIcon,
      svg: ImageIcon,
    }

    return iconMap[ext || ""] || FileText
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const startRename = (file: ProjectFile) => {
    setRenamingFile(file)
    setRenameValue(file.name)
    setIsRenameDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Files</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New {newFileType === "file" ? "File" : "Folder"}</DialogTitle>
              <DialogDescription>
                Create a new {newFileType === "file" ? "file" : "folder"} in your project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex gap-2">
                <Button
                  variant={newFileType === "file" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewFileType("file")}
                >
                  File
                </Button>
                <Button
                  variant={newFileType === "directory" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewFileType("directory")}
                >
                  Folder
                </Button>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="filename">Name</Label>
                <Input
                  id="filename"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder={newFileType === "file" ? "example.js" : "folder-name"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFile}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-1">
        {files.map((file) => {
          const Icon = getFileIcon(file)
          const isSelected = selectedFileId === file.id

          return (
            <ContextMenu key={file.id}>
              <ContextMenuTrigger>
                <div
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer ${
                    isSelected ? "bg-accent" : ""
                  }`}
                  onClick={() => {
                    if (file.file_type === "directory") {
                      toggleFolder(file.id)
                    } else {
                      onFileSelect?.(file)
                    }
                  }}
                >
                  {file.file_type === "directory" && (
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                      {expandedFolders.has(file.id) ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">{file.name}</span>
                  {file.file_type === "file" && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {Math.round(file.size_bytes / 1024)}KB
                    </span>
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => startRename(file)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Rename
                </ContextMenuItem>
                <ContextMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleDeleteFile(file)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          )
        })}

        {files.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No files yet</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setIsCreateDialogOpen(true)}>
              Create your first file
            </Button>
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename {renamingFile?.file_type === "file" ? "File" : "Folder"}</DialogTitle>
            <DialogDescription>Enter a new name for "{renamingFile?.name}".</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rename">New Name</Label>
              <Input
                id="rename"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Enter new name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameFile}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
