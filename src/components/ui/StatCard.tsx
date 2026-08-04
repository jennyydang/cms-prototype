import type { ReactNode } from 'react'
import { cx } from '../../lib/utils'

export function StatCard({
  label,
  value,
  icon,
  trend,
  accent = 'brand',
}: {
  label: string
  value: string | number
  icon: ReactNode
  trend?: { value: string; positive: boolean }
  accent?: 'brand' | 'emerald' | 'amber' | 'violet'
}) {
  const accentClasses = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
  }[accent]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={cx('flex h-10 w-10 items-center justify-center rounded-lg', accentClasses)}>{icon}</div>
      </div>
      {trend && (
        <p
          className={cx(
            'mt-3 text-xs font-medium',
            trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
          )}
        >
          {trend.value}
        </p>
      )}
    </div>
  )
}
