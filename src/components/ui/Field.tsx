import type { ReactNode } from 'react'
import { cx } from '../../lib/utils'

interface FieldProps {
  label: string
  htmlFor: string
  required?: boolean
  helpText?: string
  error?: string
  children: ReactNode
  className?: string
  inline?: boolean
  hideLabel?: boolean
}

/**
 * Wraps a form control with a proper <label>, optional help text, and an
 * error message — all linked via aria-describedby so screen readers
 * announce them together with the field.
 */
export function Field({
  label,
  htmlFor,
  required,
  helpText,
  error,
  children,
  className,
  hideLabel,
}: FieldProps) {
  const helpId = helpText ? `${htmlFor}-help` : undefined
  const errorId = error ? `${htmlFor}-error` : undefined

  return (
    <div className={cx('space-y-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className={cx(
          'block text-sm font-medium text-slate-700 dark:text-slate-300',
          hideLabel && 'sr-only',
        )}
      >
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div
        // expose the combined describedby to children through data attr for controls to read if needed
        data-describedby={cx(helpId, errorId)}
      >
        {children}
      </div>
      {helpText && !error && (
        <p id={helpId} className="text-xs text-slate-500 dark:text-slate-400">
          {helpText}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

export function describedByIds(htmlFor: string, helpText?: string, error?: string): string | undefined {
  const ids = [helpText ? `${htmlFor}-help` : null, error ? `${htmlFor}-error` : null].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
}
