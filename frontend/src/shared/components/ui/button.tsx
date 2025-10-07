import * as React from "react";
import { cn } from "../../lib/utils";

// Button variant styles with light/dark mode support
const getButtonStyles = (variant: ButtonVariant = "default", size: ButtonSize = "default"): string => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";
  
  const variantStyles = {
    default: "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white",
    destructive: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 dark:text-white",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:hover:text-white",
    secondary: "bg-gray-500 text-white hover:bg-gray-600 dark:bg-slate-600 dark:hover:bg-slate-700 dark:text-slate-200",
    ghost: "hover:bg-gray-100 text-gray-700 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white",
    link: "text-blue-500 underline-offset-4 hover:underline dark:text-blue-400 dark:hover:text-blue-300",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white",
    warning: "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white",
    info: "bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:text-white",
  };
  
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  
  return cn(baseStyles, variantStyles[variant], sizeStyles[size]);
}

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "warning" | "info"
type ButtonSize = "default" | "sm" | "lg" | "icon"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(getButtonStyles(variant, size), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button };
