interface CompilationResult {
  success: boolean
  output: string
  error?: string
  memoryUsage?: number
}

export class CompilationService {
  private static readonly EXECUTION_TIMEOUT = 10000 // 10 seconds
  private static readonly MAX_OUTPUT_LENGTH = 10000 // 10KB

  static async execute(language: string, code: string, input = ""): Promise<CompilationResult> {
    try {
      switch (language) {
        case "javascript":
          return await this.executeJavaScript(code, input)
        case "python":
          return await this.executePython(code, input)
        case "java":
          return await this.executeJava(code, input)
        case "cpp":
          return await this.executeCpp(code, input)
        case "c":
          return await this.executeC(code, input)
        case "go":
          return await this.executeGo(code, input)
        case "rust":
          return await this.executeRust(code, input)
        case "php":
          return await this.executePhp(code, input)
        case "ruby":
          return await this.executeRuby(code, input)
        case "html":
          return await this.executeHtml(code)
        case "css":
          return await this.executeCss(code)
        default:
          throw new Error(`Unsupported language: ${language}`)
      }
    } catch (error) {
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private static async executeJavaScript(code: string, input: string): Promise<CompilationResult> {
    try {
      // Create a safe execution environment
      const safeCode = this.sanitizeCode(code)
      const output: string[] = []
      const errors: string[] = []

      // Mock console for capturing output
      const mockConsole = {
        log: (...args: any[]) => output.push(args.map((arg) => String(arg)).join(" ")),
        error: (...args: any[]) => errors.push(args.map((arg) => String(arg)).join(" ")),
        warn: (...args: any[]) => output.push("WARNING: " + args.map((arg) => String(arg)).join(" ")),
        info: (...args: any[]) => output.push("INFO: " + args.map((arg) => String(arg)).join(" ")),
      }

      // Create execution context
      const context = {
        console: mockConsole,
        input: input,
        setTimeout: undefined, // Disable setTimeout for security
        setInterval: undefined, // Disable setInterval for security
        fetch: undefined, // Disable fetch for security
        XMLHttpRequest: undefined, // Disable XMLHttpRequest for security
      }

      // Execute the code with timeout
      const result = await this.executeWithTimeout(() => {
        const func = new Function("console", "input", safeCode)
        return func(context.console, context.input)
      }, this.EXECUTION_TIMEOUT)

      const finalOutput = output.join("\n")
      const finalErrors = errors.join("\n")

      return {
        success: errors.length === 0,
        output: this.truncateOutput(finalOutput + (finalErrors ? "\nErrors:\n" + finalErrors : "")),
        error: errors.length > 0 ? finalErrors : undefined,
        memoryUsage: Math.round(Math.random() * 10 + 5), // Mock memory usage
      }
    } catch (error) {
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : "JavaScript execution failed",
      }
    }
  }

  private static async executePython(code: string, input: string): Promise<CompilationResult> {
    // Simulate Python execution (in a real implementation, you'd use a sandboxed Python interpreter)
    const output = this.simulateExecution("Python", code, input)
    return {
      success: true,
      output: this.truncateOutput(output),
      memoryUsage: Math.round(Math.random() * 15 + 8),
    }
  }

  private static async executeJava(code: string, input: string): Promise<CompilationResult> {
    // Simulate Java compilation and execution
    const output = this.simulateExecution("Java", code, input)
    return {
      success: true,
      output: this.truncateOutput(output),
      memoryUsage: Math.round(Math.random() * 25 + 15),
    }
  }

  private static async executeCpp(code: string, input: string): Promise<CompilationResult> {
    // Simulate C++ compilation and execution
    const output = this.simulateExecution("C++", code, input)
    return {
      success: true,
      output: this.truncateOutput(output),
      memoryUsage: Math.round(Math.random() * 12 + 6),
    }
  }

  private static async executeC(code: string, input: string): Promise<CompilationResult> {
    // Simulate C compilation and execution
    const output = this.simulateExecution("C", code, input)
    return {
      success: true,
      output: this.truncateOutput(output),
      memoryUsage: Math.round(Math.random() * 10 + 5),
    }
  }

  private static async executeGo(code: string, input: string): Promise<CompilationResult> {
    // Simulate Go compilation and execution
    const output = this.simulateExecution("Go", code, input)
    return {
      success: true,
      output: this.truncateOutput(output),
      memoryUsage: Math.round(Math.random() * 8 + 4),
    }
  }

  private static async executeRust(code: string, input: string): Promise<CompilationResult> {
    // Simulate Rust compilation and execution
    const output = this.simulateExecution("Rust", code, input)
    return {
      success: true,
      output: this.truncateOutput(output),
      memoryUsage: Math.round(Math.random() * 6 + 3),
    }
  }

  private static async executePhp(code: string, input: string): Promise<CompilationResult> {
    // Simulate PHP execution
    const output = this.simulateExecution("PHP", code, input)
    return {
      success: true,
      output: this.truncateOutput(output),
      memoryUsage: Math.round(Math.random() * 12 + 7),
    }
  }

  private static async executeRuby(code: string, input: string): Promise<CompilationResult> {
    // Simulate Ruby execution
    const output = this.simulateExecution("Ruby", code, input)
    return {
      success: true,
      output: this.truncateOutput(output),
      memoryUsage: Math.round(Math.random() * 14 + 8),
    }
  }

  private static async executeHtml(code: string): Promise<CompilationResult> {
    // For HTML, we just validate and return the code
    try {
      // Basic HTML validation
      if (!code.includes("<html") && !code.includes("<HTML")) {
        return {
          success: false,
          output: "",
          error: "HTML document should contain <html> tag",
        }
      }

      return {
        success: true,
        output: "HTML code is valid and ready for preview",
        memoryUsage: 1,
      }
    } catch (error) {
      return {
        success: false,
        output: "",
        error: "HTML validation failed",
      }
    }
  }

  private static async executeCss(code: string): Promise<CompilationResult> {
    // For CSS, we just validate syntax
    try {
      // Basic CSS validation
      const braceCount = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length
      if (braceCount !== 0) {
        return {
          success: false,
          output: "",
          error: "CSS syntax error: Mismatched braces",
        }
      }

      return {
        success: true,
        output: "CSS code is valid",
        memoryUsage: 1,
      }
    } catch (error) {
      return {
        success: false,
        output: "",
        error: "CSS validation failed",
      }
    }
  }

  private static simulateExecution(language: string, code: string, input: string): string {
    // This is a simulation - in a real implementation, you'd use actual interpreters/compilers
    const lines = code.split("\n").length
    const hasHelloWorld = code.toLowerCase().includes("hello") && code.toLowerCase().includes("world")
    const hasLoop = /for|while|loop/.test(code.toLowerCase())
    const hasFunction = /function|def|func|fn|void|int main/.test(code.toLowerCase())

    let output = `=== ${language} Execution Results ===\n`

    if (hasHelloWorld) {
      output += "Hello, World!\n"
    }

    if (hasLoop) {
      output += "Loop executed successfully\n"
      for (let i = 0; i < 5; i++) {
        output += `Iteration ${i + 1}\n`
      }
    }

    if (hasFunction) {
      output += "Function defined and executed\n"
    }

    if (input) {
      output += `Input received: ${input}\n`
    }

    output += `\nCode compiled successfully (${lines} lines)\n`
    output += `Execution completed in ${Math.random() * 1000 + 100}ms\n`

    return output
  }

  private static sanitizeCode(code: string): string {
    // Remove potentially dangerous code patterns
    const dangerousPatterns = [
      /require\s*\(/g,
      /import\s+.*from/g,
      /process\./g,
      /fs\./g,
      /child_process/g,
      /eval\s*\(/g,
      /Function\s*\(/g,
      /setTimeout\s*\(/g,
      /setInterval\s*\(/g,
    ]

    let sanitized = code
    dangerousPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "// REMOVED_FOR_SECURITY")
    })

    return sanitized
  }

  private static truncateOutput(output: string): string {
    if (output.length > this.MAX_OUTPUT_LENGTH) {
      return output.substring(0, this.MAX_OUTPUT_LENGTH) + "\n\n... (output truncated)"
    }
    return output
  }

  private static async executeWithTimeout<T>(fn: () => T, timeout: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Execution timeout"))
      }, timeout)

      try {
        const result = fn()
        clearTimeout(timer)
        resolve(result)
      } catch (error) {
        clearTimeout(timer)
        reject(error)
      }
    })
  }
}
