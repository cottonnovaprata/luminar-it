"use client"

import React from "react"
import { ThemeProvider } from "@/contexts/theme"

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
