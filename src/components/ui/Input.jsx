import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-graphite-900 shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-graphite-400 focus-visible:outline-none focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-graphite-600 dark:bg-graphite-900/75 dark:text-graphite-100 dark:placeholder:text-graphite-400 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-900/30",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
