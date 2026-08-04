import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  File,
  Package,
  Boxes,
  Image as ImageIcon,
  Users,
  Settings,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  X,
  Layers,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { cx } from '../../lib/utils'

const typeIcon: Record<string, typeof FileText> = { FileText, File, Package }

interface SidebarProps {
  isMobileOpen: boolean
  onCloseMobile: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ isMobileOpen, onCloseMobile, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { data, currentUser } = useData()
  const [contentExpanded, setContentExpanded] = useState(true)
  const isAdmin = currentUser.role === 'Admin'

  const navLinkClasses = (isActive: boolean) =>
    cx(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
    )

  const content = (
    <nav aria-label="Main navigation" className="flex h-full flex-col gap-1 overflow-y-auto px-3 py-4">
      <NavLink to="/" end className={({ isActive }) => navLinkClasses(isActive)} onClick={onCloseMobile}>
        <LayoutDashboard className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        {!isCollapsed && 'Dashboard'}
      </NavLink>

      <div className="mt-2">
        <button
          type="button"
          onClick={() => setContentExpanded((prev) => !prev)}
          aria-expanded={contentExpanded}
          className={cx(
            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400',
            isCollapsed && 'justify-center',
          )}
        >
          {!isCollapsed && <span>Content</span>}
          {!isCollapsed && (
            <ChevronDown
              className={cx('h-3.5 w-3.5 transition-transform', contentExpanded ? '' : '-rotate-90')}
              aria-hidden="true"
            />
          )}
          {isCollapsed && <Layers className="h-4 w-4" aria-hidden="true" />}
        </button>
        {(contentExpanded || isCollapsed) && (
          <div className="mt-0.5 space-y-0.5">
            {data.contentTypes.map((type) => {
              const Icon = typeIcon[type.icon] ?? FileText
              return (
                <NavLink
                  key={type.id}
                  to={`/content/${type.slug}`}
                  className={({ isActive }) => navLinkClasses(isActive)}
                  onClick={onCloseMobile}
                  title={isCollapsed ? type.pluralName : undefined}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  {!isCollapsed && type.pluralName}
                </NavLink>
              )
            })}
          </div>
        )}
      </div>

      <div className="my-2 h-px bg-slate-200 dark:bg-slate-800" role="separator" />

      {isAdmin && (
        <NavLink to="/content-types" className={({ isActive }) => navLinkClasses(isActive)} onClick={onCloseMobile} title={isCollapsed ? 'Content Types' : undefined}>
          <Boxes className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          {!isCollapsed && 'Content Types'}
        </NavLink>
      )}
      <NavLink to="/media" className={({ isActive }) => navLinkClasses(isActive)} onClick={onCloseMobile} title={isCollapsed ? 'Media Library' : undefined}>
        <ImageIcon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        {!isCollapsed && 'Media Library'}
      </NavLink>
      {isAdmin && (
        <NavLink to="/users" className={({ isActive }) => navLinkClasses(isActive)} onClick={onCloseMobile} title={isCollapsed ? 'Users & Roles' : undefined}>
          <Users className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          {!isCollapsed && 'Users & Roles'}
        </NavLink>
      )}
      {isAdmin && (
        <NavLink to="/settings" className={({ isActive }) => navLinkClasses(isActive)} onClick={onCloseMobile} title={isCollapsed ? 'Settings' : undefined}>
          <Settings className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          {!isCollapsed && 'Settings'}
        </NavLink>
      )}

      <div className="mt-auto pt-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:flex dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          {isCollapsed ? (
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
              Collapse
            </>
          )}
        </button>
      </div>
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cx(
          'hidden shrink-0 border-r border-slate-200 bg-white transition-[width] duration-150 lg:block dark:border-slate-800 dark:bg-slate-900',
          isCollapsed ? 'w-[68px]' : 'w-64',
        )}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={onCloseMobile} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="relative flex h-full w-72 max-w-[85vw] animate-slide-up flex-col bg-white shadow-xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Menu</span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  )
}
