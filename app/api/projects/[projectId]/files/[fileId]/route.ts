import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { projectId: string; fileId: string } }) {
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

    // Fetch the file with project ownership check
    const { data: file, error } = await supabase
      .from("project_files")
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq("id", params.fileId)
      .eq("project_id", params.projectId)
      .eq("projects.user_id", user.id)
      .single()

    if (error || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    return NextResponse.json(file)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { projectId: string; fileId: string } }) {
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

    const body = await request.json()
    const { name, path, content } = body

    // Update the file
    const { data: file, error } = await supabase
      .from("project_files")
      .update({
        name: name || undefined,
        path: path || undefined,
        content: content !== undefined ? content : undefined,
        size_bytes: content !== undefined ? content.length : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.fileId)
      .eq("project_id", params.projectId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update file" }, { status: 500 })
    }

    return NextResponse.json(file)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { projectId: string; fileId: string } }) {
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

    // Delete the file
    const { error } = await supabase
      .from("project_files")
      .delete()
      .eq("id", params.fileId)
      .eq("project_id", params.projectId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
