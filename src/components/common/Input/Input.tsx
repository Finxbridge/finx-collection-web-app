/**
 * Reusable Input Component
 */

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@utils'
import './Input.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="input-wrapper">
        {label && (
          <label htmlFor={props.id} className="input-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn('input', error && 'input--error', className)}
          {...props}
        />
        {error && <span className="input-error">{error}</span>}
        {helperText && !error && <span className="input-helper">{helperText}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
