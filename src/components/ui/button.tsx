import * as React from "react"
import { clsx } from "clsx"

const buttonVariants = {
  default: "bg-red-600 text-white hover:bg-red-700 border-red-600",
  destructive: "bg-red-500 text-white hover:bg-red-600 border-red-500",
  outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-900",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border-gray-300",
  ghost: "hover:bg-gray-100 text-gray-900",
  link: "text-red-600 underline-offset-4 hover:underline"
}

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10"
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"
    return (
      <Comp
        className={clsx(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }