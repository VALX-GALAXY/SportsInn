import * as React from "react"
import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grid gap-2", className)}
      role="radiogroup"
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onCheckedChange: () => onValueChange?.(child.props.value),
          })
        }
        return child
      })}
    </div>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef(({ className, value, checked, onCheckedChange, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "flex items-center space-x-2 cursor-pointer rounded-md border border-input bg-background dark:bg-white/10 dark:border-white/20 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
        checked && "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500",
        className
      )}
    >
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={(e) => {
          if (e.target.checked) {
            onCheckedChange?.()
          }
        }}
        className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 dark:border-slate-600 cursor-pointer"
        {...props}
      />
      <span className={cn(
        "flex-1 text-slate-900 dark:text-slate-100",
        checked && "font-medium"
      )}>
        {children}
      </span>
    </label>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }

