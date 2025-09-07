"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { FileExplorer } from "@/components/file-explorer"
import { FolderOpen, Plus, ChevronRight, ChevronDown, Folder, FileText, Code, Globe } from "lucide-react"
import Link from "next/link"

const languages = [
  { id: "javascript", name: "JavaScript", icon: Code, color: "bg-yellow-500" },
  { id: "typescript", name: "TypeScript", icon: Code, color: "bg-blue-500" },
  { id: "python", name: "Python", icon: Code, color: "bg-green-500" },
  { id: "java", name: "Java", icon: Code, color: "bg-orange-500" },
  { id: "cpp", name: "C++", icon: Code, color: "bg-purple-500" },
  { id: "go", name: "Go", icon: Code, color: "bg-cyan-500" },
  { id: "rust", name: "Rust", icon: Code, color: "bg-red-500" },
  { id: "html", name: "HTML", icon: Globe, color: "bg-orange-400" },
]

interface Project {
  id: string
  name: string
  language: string
}

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

interface SidebarProps {
  currentProjectId?: string
  onFileSelect?: (file: ProjectFile) => void
  selectedFileId?: string
}

export function Sidebar({ currentProjectId, onFileSelect, selectedFileId }: SidebarProps) {
  const [isProjectsOpen, setIsProjectsOpen] = useState(true)
  const [isFilesOpen, setIsFilesOpen] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data.slice(0, 5)) // Show only first 5 projects
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    }
  }

  return (
    <div className="w-80 border-r border-border bg-background/50 backdrop-blur">
      <div className="p-4 space-y-4">
        {/* Language Selector */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Language</h3>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <Button
                key={lang.id}
                variant={selectedLanguage === lang.id ? "default" : "outline"}
                size="sm"
                className="justify-start gap-2 h-8"
                onClick={() => setSelectedLanguage(lang.id)}
              >
                <div className={`w-2 h-2 rounded-full ${lang.color}`} />
                <span className="text-xs">{lang.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Project Explorer */}
        <div className="space-y-2">
          <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 h-8 px-2">
                {isProjectsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <FolderOpen className="h-4 w-4" />
                <span className="text-sm">Projects</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 ml-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer ${
                    currentProjectId === project.id ? "bg-accent" : ""
                  }`}
                >
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">{project.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {project.language.toUpperCase()}
                  </Badge>
                </div>
              ))}
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8">
                  <Plus className="h-4 w-4" />
                  Manage Projects
                </Button>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* File Explorer */}
        <div className="space-y-2">
          <Collapsible open={isFilesOpen} onOpenChange={setIsFilesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 h-8 px-2">
                {isFilesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <FileText className="h-4 w-4" />
                <span className="text-sm">Files</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-6">
              {currentProjectId ? (
                <FileExplorer
                  projectId={currentProjectId}
                  onFileSelect={onFileSelect}
                  selectedFileId={selectedFileId}
                />
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Select a project to view files</p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}
