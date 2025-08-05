"use client"

import type React from "react"

import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon && <div className="mb-6 text-muted-foreground/50">{icon}</div>}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-muted-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground/80 max-w-sm">{description}</p>
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-6 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
          variant="secondary"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
