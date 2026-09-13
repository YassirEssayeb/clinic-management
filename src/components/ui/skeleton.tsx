import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("animate-pulse bg-muted rounded-lg", className)}
      {...props}
    />
  )
)
Skeleton.displayName = "Skeleton"

export { Skeleton }
