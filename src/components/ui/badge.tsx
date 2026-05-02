import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-xl border-2 border-transparent px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-primary shadow-black/10",
        secondary:
          "bg-[#f4f2ef] text-[#1c1c1c] border-[#dcd7cf]",
        destructive:
          "bg-rose-50 text-rose-600 border-rose-100",
        outline:
          "border-[#dcd7cf] text-[#535366] bg-white hover:bg-[#f4f2ef]",
        ghost:
          "hover:bg-[#f4f2ef] text-[#535366]",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
