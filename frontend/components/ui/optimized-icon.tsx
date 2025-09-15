"use client"

import { memo } from "react"
import { LucideIcon } from "lucide-react"

interface OptimizedIconProps {
  icon: LucideIcon
  className?: string
  size?: number
  'aria-label'?: string
}

export const OptimizedIcon = memo(({ icon: Icon, className, size = 24, 'aria-label': ariaLabel }: OptimizedIconProps) => {
  return (
    <Icon 
      className={className} 
      size={size}
      aria-label={ariaLabel}
      focusable="false"
      role={ariaLabel ? "img" : "presentation"}
    />
  )
})

OptimizedIcon.displayName = "OptimizedIcon"