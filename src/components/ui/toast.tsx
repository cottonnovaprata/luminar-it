"use client"

import * as React from "react"
import { X, Check, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "info" | "warning"

interface ToastProps {
  type: ToastType
  title: string
  description?: string
  onClose: () => void
  autoClose?: number
}

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case "success":
      return {
        bg: "bg-[var(--status-success-bg)]",
        border: "border-[var(--status-success)]/30",
        text: "text-[var(--status-success)]",
        icon: Check,
      }
    case "error":
      return {
        bg: "bg-[var(--status-error-bg)]",
        border: "border-[var(--status-error)]/30",
        text: "text-[var(--status-error)]",
        icon: AlertCircle,
      }
    case "warning":
      return {
        bg: "bg-[var(--status-warning-bg)]",
        border: "border-[var(--status-warning)]/30",
        text: "text-[var(--status-warning)]",
        icon: AlertCircle,
      }
    default:
      return {
        bg: "bg-[var(--status-info-bg)]",
        border: "border-[var(--status-info)]/30",
        text: "text-[var(--status-info)]",
        icon: Info,
      }
  }
}

export function Toast({
  type,
  title,
  description,
  onClose,
  autoClose = 5000,
}: ToastProps) {
  const styles = getToastStyles(type)
  const Icon = styles.icon

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, autoClose)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose])

  return (
    <div
      className={cn(
        "animate-in slide-in-from-bottom-4 duration-300 rounded-lg border p-4 shadow-lg",
        styles.bg,
        styles.border
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", styles.text)} />
        <div className="flex-1">
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </p>
          {description && (
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className={cn("text-lg opacity-60 hover:opacity-100 transition-opacity", styles.text)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
