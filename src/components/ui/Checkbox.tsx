import { forwardRef, type InputHTMLAttributes } from 'react'
import { cx } from '../../lib/utils'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const input = (
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={cx(
          'h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          'dark:border-slate-600 dark:bg-slate-800',
          className,
        )}
        {...props}
      />
    )

    if (!label) return input

    return (
      <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        {input}
        {label}
      </label>
    )
  },
)
Checkbox.displayName = 'Checkbox'
