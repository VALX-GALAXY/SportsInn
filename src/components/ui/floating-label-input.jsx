import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

const FloatingLabelInput = React.forwardRef(({ 
  label, 
  id, 
  className, 
  value, 
  error,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const hasValue = value && value.toString().length > 0
  const isFloating = isFocused || hasValue

  return (
    <div className="relative">
      <Input
        ref={ref}
        id={id}
        value={value}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        className={cn(
          "peer pt-6 pb-2",
          "transition-all duration-300 ease-in-out",
          isFocused && !error && "border-blue-500 ring-2 ring-blue-500/20 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]",
          error && "border-red-500 ring-2 ring-red-500/20",
          className
        )}
        {...props}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute left-3 transition-all duration-300 pointer-events-none",
          "text-sm font-medium",
          isFloating
            ? "top-2 text-xs text-blue-600 dark:text-blue-400"
            : "top-3 text-base text-slate-500 dark:text-slate-400",
          error && "text-red-500 dark:text-red-400"
        )}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  )
})

FloatingLabelInput.displayName = "FloatingLabelInput"

export { FloatingLabelInput }

