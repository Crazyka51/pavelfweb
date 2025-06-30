"use client"

/**
 * Sheet component rebuilt on top of the `vaul` primitives.
 * Public API is 100 % compatible with the original shadcn/ui helper
 * (Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter,
 *  SheetTitle, SheetDescription, SheetClose).
 */

import * as React from "react"
import {
  Sheet as SheetRoot,
  SheetTrigger,
  SheetContent as SheetContentPrimitive,
  SheetClose,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "vaul"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// ––– Styled Content --------------------------------------------------------
// ---------------------------------------------------------------------------
const SheetContent = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof SheetContentPrimitive>>(
  ({ className, side = "right", ...props }, ref) => {
    // `side` prop is kept for backwards compatibility with the old Radix helper
    return (
      <SheetContentPrimitive
        ref={ref}
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg outline-none",
          // size + transform
          "data-[open=false]:translate-x-full data-[open=true]:translate-x-0 transition-transform",
          // width per breakpoint
          "w-[90vw] sm:w-[450px]",
          className,
        )}
        {...props}
      />
    )
  },
)
SheetContent.displayName = "SheetContent"

// ---------------------------------------------------------------------------
// ––– Exports ---------------------------------------------------------------
// ---------------------------------------------------------------------------
export {
  // root & trigger
  SheetRoot as Sheet,
  SheetTrigger,
  // content + helpers
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
}
