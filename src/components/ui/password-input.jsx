import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { FloatingLabelInput } from "./floating-label-input"

const PasswordInput = React.forwardRef(({ 
  label, 
  id, 
  className, 
  value, 
  error,
  showPasswordRequirements = false,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="space-y-2">
      <div className="relative">
        <FloatingLabelInput
          ref={ref}
          id={id}
          type={showPassword ? "text" : "password"}
          label={label}
          value={value}
          error={error}
          className={cn("pr-11", className)}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 z-10"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowPassword(!showPassword)
          }}
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      {showPasswordRequirements && value && (
        <div className="space-y-1 mt-2">
          <div className="text-xs text-slate-600 dark:text-slate-100">Password requirements:</div>
          <div className="space-y-1">
            <div className={`text-xs flex items-center ${value.length >= 8 ? 'text-green-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>
              <span className="mr-1">{value.length >= 8 ? '✓' : '○'}</span>
              At least 8 characters
            </div>
            <div className={`text-xs flex items-center ${/[a-zA-Z]/.test(value) ? 'text-green-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>
              <span className="mr-1">{/[a-zA-Z]/.test(value) ? '✓' : '○'}</span>
              At least one letter
            </div>
            <div className={`text-xs flex items-center ${/\d/.test(value) ? 'text-green-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>
              <span className="mr-1">{/\d/.test(value) ? '✓' : '○'}</span>
              At least one number
            </div>
            <div className={`text-xs flex items-center ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value) ? 'text-green-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>
              <span className="mr-1">{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value) ? '✓' : '○'}</span>
              At least one special character
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }

