import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[84px] w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-graphite-900 shadow-sm transition-all duration-200 placeholder:text-graphite-400 focus-visible:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-graphite-600 dark:bg-graphite-900/75 dark:text-graphite-100 dark:placeholder:text-graphite-400 dark:focus-visible:border-blue-400 dark:focus-visible:ring-blue-900/30",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
