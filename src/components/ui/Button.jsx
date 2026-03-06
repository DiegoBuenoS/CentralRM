import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#255b9c] text-white shadow-sm hover:bg-[#1f4f8b] hover:shadow focus-visible:ring-blue-300",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow",
        outline:
          "border border-slate-300 bg-white text-graphite-800 shadow-sm hover:border-slate-400 hover:bg-slate-50 dark:border-graphite-600 dark:bg-graphite-900/75 dark:text-graphite-100 dark:hover:bg-graphite-800/75",
        secondary:
          "bg-slate-100 text-slate-800 shadow-sm hover:bg-slate-200",
        ghost: "text-graphite-700 hover:bg-slate-100 hover:text-slate-900 dark:text-graphite-300 dark:hover:bg-graphite-800/70 dark:hover:text-graphite-50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
