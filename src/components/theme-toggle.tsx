"use client"

import React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/contexts/theme"
import { Button } from "./ui/button"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 text-zinc-400 hover:text-zinc-200"
      title={`Mudar para tema ${theme === "dark" ? "claro" : "escuro"}`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}
