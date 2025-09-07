"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { CodeEditor } from "@/components/code-editor"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

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

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined)
  const [selectedFile, setSelectedFile] = useState<ProjectFile | undefined>(undefined)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)

      if (!user) {
        router.push("/auth/login")
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        router.push("/auth/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handleFileSelect = (file: ProjectFile) => {
    setSelectedFile(file)
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentProjectId={currentProjectId}
          onFileSelect={handleFileSelect}
          selectedFileId={selectedFile?.id}
        />
        <main className="flex-1 flex flex-col">
          <CodeEditor selectedFile={selectedFile} projectId={currentProjectId} />
        </main>
      </div>
    </div>
  )
}
