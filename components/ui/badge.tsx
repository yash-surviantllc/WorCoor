import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:shadow-md",
        secondary:
          "border-transparent bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 hover:from-slate-200 hover:to-slate-300 dark:from-slate-700 dark:to-slate-600 dark:text-slate-100",
        destructive: "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:shadow-md",
        outline:
          "border-slate-200 text-slate-700 bg-white/80 backdrop-blur-sm hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:bg-slate-800/80",
        success: "border-transparent bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm hover:shadow-md",
        warning: "border-transparent bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm hover:shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  // If a custom background or text color is provided in className, use a neutral variant
  // to prevent conflicts with the default gradient backgrounds
  const hasCustomBg = className?.includes('bg-');
  const hasCustomTextColor = className?.includes('text-');
  
  // Apply the variant styles, but ensure custom styles can override them
  return <div className={cn(badgeVariants({ variant: hasCustomBg ? 'outline' : variant }), className)} {...props} ></div>
}

export { Badge, badgeVariants }
