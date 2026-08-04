import { useId, useState, type ReactNode } from 'react'
import { cx } from '../../lib/utils'

export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: string
  children: ReactNode
  side?: 'top' | 'bottom'
}) {
  const [visible, setVisible] = useState(false)
  const id = useId()

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {/* Clone-free approach: wrap child, attach aria-describedby via the child if it accepts it isn't guaranteed,
          so we rely on a visually adjacent live region instead. */}
      <span aria-describedby={visible ? id : undefined}>{children}</span>
      <span
        role="tooltip"
        id={id}
        className={cx(
          'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg transition-opacity dark:bg-slate-700',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      >
        {content}
      </span>
    </span>
  )
}
