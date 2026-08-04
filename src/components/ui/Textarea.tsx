import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cx } from '../../lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cx(
          'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          'dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800',
          invalid
            ? 'border-red-400 dark:border-red-500'
            : 'border-slate-300 dark:border-slate-700',
          className,
        )}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'
