import { useNavigate } from 'react-router-dom'
import { Menu, Search, Sun, Moon, Monitor, LogOut, User as UserIcon, Bell } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useCommandPalette } from '../../context/CommandPaletteContext'
import { useData } from '../../context/DataContext'
import { Avatar } from '../ui/Avatar'
import { Dropdown, DropdownItem, DropdownSeparator } from '../ui/Dropdown'
import { Badge } from '../ui/Badge'
import { timeAgo } from '../../lib/utils'

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { resolvedTheme, theme, setTheme } = useTheme()
  const { open } = useCommandPalette()
  const { currentUser, data } = useData()
  const navigate = useNavigate()

  const ThemeIcon = theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun
  const recentActivity = data.activity.slice(0, 5)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/80">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <a
        href="/"
        onClick={(e) => {
          e.preventDefault()
          navigate('/')
        }}
        className="hidden items-center gap-2 font-semibold text-slate-900 sm:flex dark:text-white"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-sm text-white">A</span>
        Atlas CMS
      </a>

      <button
        type="button"
        onClick={open}
        className="ml-2 flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm text-slate-400 hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:max-w-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Search or jump to…</span>
        <span className="sm:hidden">Search</span>
        <kbd className="ml-auto hidden items-center rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:inline-flex dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {recentActivity.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-slate-900" aria-hidden="true" />
              )}
            </button>
          }
        >
          <div className="px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recent activity</p>
          </div>
          {recentActivity.map((entry) => {
            const actor = data.users.find((u) => u.id === entry.actorId)
            return (
              <div key={entry.id} className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="font-medium text-slate-900 dark:text-white">{actor?.name ?? 'Someone'}</span>{' '}
                {entry.message}
                <div className="text-xs text-slate-400">{timeAgo(entry.timestamp)}</div>
              </div>
            )
          })}
        </Dropdown>

        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label={`Theme: ${theme}`}
            >
              <ThemeIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          }
        >
          <DropdownItem icon={<Sun className="h-4 w-4" aria-hidden="true" />} onClick={() => setTheme('light')}>
            Light {theme === 'light' && <Badge className="ml-auto">On</Badge>}
          </DropdownItem>
          <DropdownItem icon={<Moon className="h-4 w-4" aria-hidden="true" />} onClick={() => setTheme('dark')}>
            Dark {theme === 'dark' && <Badge className="ml-auto">On</Badge>}
          </DropdownItem>
          <DropdownItem icon={<Monitor className="h-4 w-4" aria-hidden="true" />} onClick={() => setTheme('system')}>
            System {theme === 'system' && <Badge className="ml-auto">On</Badge>}
          </DropdownItem>
        </Dropdown>

        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={`Account menu for ${currentUser.name}`}
            >
              <Avatar name={currentUser.name} gradient={currentUser.avatarColor} size="sm" />
            </button>
          }
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{currentUser.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
          </div>
          <DropdownSeparator />
          <DropdownItem icon={<UserIcon className="h-4 w-4" aria-hidden="true" />} onClick={() => navigate('/profile')}>
            Your profile
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem icon={<LogOut className="h-4 w-4" aria-hidden="true" />}>Sign out</DropdownItem>
        </Dropdown>
      </div>
    </header>
  )
}
