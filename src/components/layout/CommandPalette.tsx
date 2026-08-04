import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Boxes,
  Image as ImageIcon,
  Users,
  Settings,
  FileText,
  Plus,
  Search,
  CornerDownLeft,
} from 'lucide-react'
import { useCommandPalette } from '../../context/CommandPaletteContext'
import { useData } from '../../context/DataContext'
import { cx } from '../../lib/utils'

interface Command {
  id: string
  label: string
  hint?: string
  icon: ReactNode
  onSelect: () => void
  group: string
}

export function CommandPalette() {
  const { isOpen, close } = useCommandPalette()
  const navigate = useNavigate()
  const { data } = useData()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = [
      { id: 'nav-dashboard', label: 'Go to Dashboard', icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />, onSelect: () => navigate('/'), group: 'Navigate' },
      { id: 'nav-types', label: 'Go to Content Types', icon: <Boxes className="h-4 w-4" aria-hidden="true" />, onSelect: () => navigate('/content-types'), group: 'Navigate' },
      { id: 'nav-media', label: 'Go to Media Library', icon: <ImageIcon className="h-4 w-4" aria-hidden="true" />, onSelect: () => navigate('/media'), group: 'Navigate' },
      { id: 'nav-users', label: 'Go to Users & Roles', icon: <Users className="h-4 w-4" aria-hidden="true" />, onSelect: () => navigate('/users'), group: 'Navigate' },
      { id: 'nav-settings', label: 'Go to Settings', icon: <Settings className="h-4 w-4" aria-hidden="true" />, onSelect: () => navigate('/settings'), group: 'Navigate' },
    ]
    const create: Command[] = data.contentTypes.map((type) => ({
      id: `create-${type.id}`,
      label: `New ${type.name}`,
      icon: <Plus className="h-4 w-4" aria-hidden="true" />,
      onSelect: () => navigate(`/content/${type.slug}/new`),
      group: 'Create',
    }))
    const items: Command[] = data.content.slice(0, 30).map((item) => {
      const type = data.contentTypes.find((t) => t.id === item.contentTypeId)
      return {
        id: `content-${item.id}`,
        label: item.title,
        hint: type?.name,
        icon: <FileText className="h-4 w-4" aria-hidden="true" />,
        onSelect: () => navigate(`/content/${type?.slug}/${item.id}`),
        group: 'Content',
      }
    })
    return [...nav, ...create, ...items]
  }, [data, navigate])

  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.hint?.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (!isOpen) return null

  function handleKeyDown(event: ReactKeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const cmd = filtered[activeIndex]
      if (cmd) {
        cmd.onSelect()
        close()
      }
    } else if (event.key === 'Escape') {
      close()
    }
  }

  let runningIndex = -1
  const groups = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    acc[cmd.group] = acc[cmd.group] ?? []
    acc[cmd.group].push(cmd)
    return acc
  }, {})

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh] animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] dark:bg-black/60" onClick={close} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl animate-slide-up dark:bg-slate-900 dark:ring-1 dark:ring-slate-800"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
          <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-activedescendant={filtered[activeIndex] ? `cmd-${filtered[activeIndex].id}` : undefined}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, content, and actions…"
            className="w-full border-0 bg-transparent py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
          />
          <kbd className="hidden shrink-0 rounded border border-slate-300 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline dark:border-slate-600">
            ESC
          </kbd>
        </div>
        <ul ref={listRef} id="command-palette-list" role="listbox" className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No results found.</li>
          )}
          {Object.entries(groups).map(([group, items]) => (
            <li key={group}>
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{group}</p>
              <ul>
                {items.map((cmd) => {
                  runningIndex += 1
                  const index = runningIndex
                  const active = index === activeIndex
                  return (
                    <li key={cmd.id} data-index={index}>
                      <button
                        id={`cmd-${cmd.id}`}
                        role="option"
                        aria-selected={active}
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => {
                          cmd.onSelect()
                          close()
                        }}
                        className={cx(
                          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm',
                          active
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                            : 'text-slate-700 dark:text-slate-300',
                        )}
                      >
                        {cmd.icon}
                        <span className="flex-1 truncate">{cmd.label}</span>
                        {cmd.hint && <span className="text-xs text-slate-400">{cmd.hint}</span>}
                        {active && <CornerDownLeft className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  )
}
