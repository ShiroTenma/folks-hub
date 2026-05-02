import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border-2 border-[#dcd7cf] bg-white/50 px-4 py-2 text-sm font-bold transition-all outline-none placeholder:text-[#535366]/30 focus-visible:border-[#1c1c1c] focus-visible:ring-4 focus-visible:ring-[#1c1c1c]/10 disabled:opacity-50 disabled:bg-[#f4f2ef]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
