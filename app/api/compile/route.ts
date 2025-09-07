import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { CompilationService } from "@/lib/compilation-service"

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
    const { code, language, projectId, input = "" } = body

    // Validate required fields
    if (!code || !language) {
      return NextResponse.json({ error: "Code and language are required" }, { status: 400 })
    }

    // Validate language support
    const supportedLanguages = ["javascript", "python", "java", "cpp", "c", "go", "rust", "php", "ruby", "html", "css"]
    if (!supportedLanguages.includes(language)) {
      return NextResponse.json({ error: `Language ${language} is not supported` }, { status: 400 })
    }

    const startTime = Date.now()

    try {
      // Execute the code using the compilation service
      const result = await CompilationService.execute(language, code, input)
      const executionTime = Date.now() - startTime

      // Log the compilation result to database
      if (projectId) {
        await supabase.from("compilation_logs").insert({
          project_id: projectId,
          user_id: user.id,
          language,
          status: result.success ? "success" : "error",
          output: result.output,
          error_message: result.error,
          execution_time_ms: executionTime,
          memory_usage_mb: result.memoryUsage || 0,
        })
      }

      return NextResponse.json({
        success: result.success,
        output: result.output,
        error: result.error,
        executionTime,
        memoryUsage: result.memoryUsage,
      })
    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : "Unknown compilation error"

      // Log the error to database
      if (projectId) {
        await supabase.from("compilation_logs").insert({
          project_id: projectId,
          user_id: user.id,
          language,
          status: "error",
          error_message: errorMessage,
          execution_time_ms: executionTime,
        })
      }

      return NextResponse.json({
        success: false,
        output: "",
        error: errorMessage,
        executionTime,
      })
    }
  } catch (error) {
    console.error("Compilation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
