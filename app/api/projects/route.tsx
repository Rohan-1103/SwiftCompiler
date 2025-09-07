import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
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

    // Fetch user's projects
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
    }

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { name, description, language, template, is_public } = body

    // Validate required fields
    if (!name || !language) {
      return NextResponse.json({ error: "Name and language are required" }, { status: 400 })
    }

    // Create the project
    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        language,
        template: template || "blank",
        is_public: is_public || false,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
    }

    // Create initial project files based on template
    await createInitialFiles(supabase, project.id, user.id, language, template)

    return NextResponse.json(project)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function createInitialFiles(
  supabase: any,
  projectId: string,
  userId: string,
  language: string,
  template: string,
) {
  const templates: Record<string, Record<string, string>> = {
    javascript: {
      "main.js": template === "hello-world" ? 'console.log("Hello, World!");' : "// Start coding here...",
    },
    python: {
      "main.py": template === "hello-world" ? 'print("Hello, World!")' : "# Start coding here...",
    },
    java: {
      "Main.java":
        template === "hello-world"
          ? 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'
          : "public class Main {\n    public static void main(String[] args) {\n        // Start coding here...\n    }\n}",
    },
    cpp: {
      "main.cpp":
        template === "hello-world"
          ? '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}'
          : "#include <iostream>\n\nint main() {\n    // Start coding here...\n    return 0;\n}",
    },
    html: {
      "index.html":
        template === "hello-world"
          ? "<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>"
          : "<!DOCTYPE html>\n<html>\n<head>\n    <title>My Project</title>\n</head>\n<body>\n    <!-- Start coding here... -->\n</body>\n</html>",
    },
  }

  const files = templates[language] || { "main.txt": "// Start coding here..." }

  for (const [fileName, content] of Object.entries(files)) {
    await supabase.from("project_files").insert({
      project_id: projectId,
      user_id: userId,
      name: fileName,
      path: fileName,
      content,
      file_type: "file",
      mime_type: getMimeType(fileName),
      size_bytes: content.length,
    })
  }
}

function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    js: "application/javascript",
    py: "text/x-python",
    java: "text/x-java-source",
    cpp: "text/x-c++src",
    c: "text/x-csrc",
    html: "text/html",
    css: "text/css",
    json: "application/json",
    md: "text/markdown",
    txt: "text/plain",
  }
  return mimeTypes[ext || ""] || "text/plain"
}
