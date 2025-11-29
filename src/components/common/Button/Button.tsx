/**
 * Reusable Button Component
 * Common UI component used throughout the application
 */

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@utils'
import './Button.css'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'button',
        `button--${variant}`,
        `button--${size}`,
        isLoading && 'button--loading',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="button__loader">Loading...</span>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
