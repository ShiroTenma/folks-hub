import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-black uppercase tracking-widest whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-black/5",
        outline:
          "border-2 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:opacity-90 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground shadow-md",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-6",
        xs: "h-11 md:h-7 gap-1 rounded-lg px-3 text-[10px] uppercase tracking-widest",
        sm: "h-11 md:h-9 gap-1.5 px-4 text-[11px] uppercase tracking-widest",
        lg: "h-14 gap-3 px-10 text-xs tracking-[0.2em]",
        icon: "size-11 rounded-2xl",
        "icon-xs": "size-11 md:size-7 rounded-lg",
        "icon-sm": "size-11 md:size-9 rounded-xl",
        "icon-lg": "size-14 rounded-[1.5rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      render={asChild && React.isValidElement(children) ? children : undefined}
      nativeButton={asChild ? false : undefined}
      {...props}
    >
      {asChild ? undefined : children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
