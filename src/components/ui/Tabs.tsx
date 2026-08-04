import { useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { cx } from '../../lib/utils'

export interface TabItem {
  id: string
  label: string
  icon?: ReactNode
  badge?: ReactNode
}

export function Tabs({
  tabs,
  activeId,
  onChange,
  panelId,
}: {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
  panelId?: string
}) {
  const listRef = useRef<HTMLDivElement>(null)

  function handleKeyDown(event: ReactKeyboardEvent) {
    const index = tabs.findIndex((t) => t.id === activeId)
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      onChange(tabs[(index + 1) % tabs.length].id)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      onChange(tabs[(index - 1 + tabs.length) % tabs.length].id)
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className="flex gap-1 border-b border-slate-200 dark:border-slate-800"
    >
      {tabs.map((tab) => {
        const selected = tab.id === activeId
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={panelId ?? `panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cx(
              '-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              selected
                ? 'border-brand-600 text-brand-700 dark:border-brand-500 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge}
          </button>
        )
      })}
    </div>
  )
}
