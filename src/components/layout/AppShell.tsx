import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { CommandPalette } from './CommandPalette'
import { ToastViewport } from '../ui/ToastViewport'

export function AppShell() {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <a
        href="#main-content"
        className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
      >
        Skip to main content
      </a>

      <Sidebar
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto focus:outline-none">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette />
      <ToastViewport />
    </div>
  )
}
