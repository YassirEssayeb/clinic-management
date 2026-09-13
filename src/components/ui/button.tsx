"use client"

import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "text" | "outline"
  size?: "sm" | "md" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-label-md rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"

    const variants = {
      primary:
        "bg-primary text-primary-foreground hover:opacity-90 shadow-sm",
      secondary:
        "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
      ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
      danger:
        "bg-destructive text-destructive-foreground hover:opacity-90",
      text: "text-primary hover:underline",
      outline: "border border-border/80 text-foreground bg-background hover:bg-muted hover:text-foreground",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
