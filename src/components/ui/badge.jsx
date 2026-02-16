import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary:
          "border-graphite-200 bg-graphite-100 text-graphite-700 hover:bg-graphite-200 dark:border-graphite-700 dark:bg-graphite-800 dark:text-graphite-200 dark:hover:bg-graphite-700",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border-graphite-300 bg-transparent text-graphite-700 dark:border-graphite-700 dark:text-graphite-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<span className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
