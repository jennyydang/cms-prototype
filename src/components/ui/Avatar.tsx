import { cx, initials } from '../../lib/utils'

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

export function Avatar({
  name,
  gradient = 'from-slate-400 to-slate-600',
  size = 'sm',
  className,
}: {
  name: string
  gradient?: string
  size?: keyof typeof sizeClasses
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white',
        gradient,
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
