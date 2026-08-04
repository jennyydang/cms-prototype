import type { ReactNode } from 'react'
import { Circle, CheckCircle2, Clock, PenLine, Archive } from 'lucide-react'
import { cx } from '../../lib/utils'
import type { ContentStatus } from '../../lib/types'

type BadgeColor = 'slate' | 'brand' | 'emerald' | 'amber' | 'red' | 'violet'

const colorClasses: Record<BadgeColor, string> = {
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
}

export function Badge({
  children,
  color = 'slate',
  icon,
  className,
}: {
  children: ReactNode
  color?: BadgeColor
  icon?: ReactNode
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        colorClasses[color],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

const statusConfig: Record<ContentStatus, { label: string; color: BadgeColor; icon: ReactNode }> = {
  draft: { label: 'Draft', color: 'slate', icon: <PenLine className="h-3 w-3" aria-hidden="true" /> },
  'in-review': { label: 'In review', color: 'amber', icon: <Clock className="h-3 w-3" aria-hidden="true" /> },
  scheduled: { label: 'Scheduled', color: 'violet', icon: <Clock className="h-3 w-3" aria-hidden="true" /> },
  published: { label: 'Published', color: 'emerald', icon: <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> },
  archived: { label: 'Archived', color: 'slate', icon: <Archive className="h-3 w-3" aria-hidden="true" /> },
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  const config = statusConfig[status] ?? { label: status, color: 'slate' as const, icon: <Circle className="h-3 w-3" /> }
  return (
    <Badge color={config.color} icon={config.icon}>
      {config.label}
    </Badge>
  )
}
