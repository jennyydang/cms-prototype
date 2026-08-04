import { cx } from '../../lib/utils'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  hideLabel?: boolean
  description?: string
  id?: string
  disabled?: boolean
}

export function Switch({ checked, onChange, label, hideLabel, description, id, disabled }: SwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {!hideLabel && (
        <span className="flex flex-col">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</span>
          {description && <span className="text-xs text-slate-500 dark:text-slate-400">{description}</span>}
        </span>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={hideLabel ? label : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
          checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span
          className={cx(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-150',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  )
}
