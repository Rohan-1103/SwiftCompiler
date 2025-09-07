import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Fetch project files
    const { data: files, error } = await supabase
      .from("project_files")
      .select("*")
      .eq("project_id", params.id)
      .order("path", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
    }

    return NextResponse.json(files)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, path, content = "", file_type = "file" } = body

    // Validate required fields
    if (!name || !path) {
      return NextResponse.json({ error: "Name and path are required" }, { status: 400 })
    }

    // Check if file already exists
    const { data: existingFile } = await supabase
      .from("project_files")
      .select("id")
      .eq("project_id", params.id)
      .eq("path", path)
      .single()

    if (existingFile) {
      return NextResponse.json({ error: "File already exists at this path" }, { status: 409 })
    }

    // Create the file
    const { data: file, error } = await supabase
      .from("project_files")
      .insert({
        project_id: params.id,
        user_id: user.id,
        name,
        path,
        content,
        file_type,
        mime_type: getMimeType(name),
        size_bytes: content.length,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create file" }, { status: 500 })
    }

    return NextResponse.json(file)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    js: "application/javascript",
    ts: "application/typescript",
    py: "text/x-python",
    java: "text/x-java-source",
    cpp: "text/x-c++src",
    c: "text/x-csrc",
    go: "text/x-go",
    rs: "text/x-rust",
    php: "text/x-php",
    rb: "text/x-ruby",
    swift: "text/x-swift",
    kt: "text/x-kotlin",
    cs: "text/x-csharp",
    html: "text/html",
    css: "text/css",
    json: "application/json",
    md: "text/markdown",
    txt: "text/plain",
    xml: "text/xml",
    yml: "text/yaml",
    yaml: "text/yaml",
  }
  return mimeTypes[ext || ""] || "text/plain"
}
