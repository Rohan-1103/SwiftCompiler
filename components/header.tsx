"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserMenu } from "@/components/user-menu"
import { Play, Save, Download, Share2, Settings, Moon, Sun, Code2 } from "lucide-react"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onRun?: () => void
  onSave?: () => void
  isRunning?: boolean
  isSaving?: boolean
  hasUnsavedChanges?: boolean
}

export function Header({ onRun, onSave, isRunning, isSaving, hasUnsavedChanges }: HeaderProps) {
  const { setTheme, theme } = useTheme()

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              SwiftCompiler
            </h1>
          </div>
          <Badge variant="secondary" className="text-xs">
            Beta
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onRun && (
            <Button size="sm" className="gap-2" onClick={onRun} disabled={isRunning}>
              <Play className="h-4 w-4" />
              {isRunning ? "Running..." : "Run"}
            </Button>
          )}
          {onSave && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={onSave}
              disabled={!hasUnsavedChanges || isSaving}
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Settings className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <UserMenu />
        </div>
      </div>
    </header>
  )
}
