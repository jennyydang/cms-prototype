import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../../lib/utils'

interface DropdownProps {
  trigger: ReactElement<Record<string, unknown>>
  children: ReactNode
  align?: 'left' | 'right'
}

/**
 * Accessible menu-button pattern: trigger toggles a floating menu,
 * arrow keys move between items, Escape closes and returns focus.
 */
export function Dropdown({ trigger, children, align = 'right' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!isOpen) return

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      setCoords({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX, width: rect.width })
    }
    updatePosition()

    function handleClickOutside(event: MouseEvent) {
      if (
        !menuRef.current?.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    // focus first item
    const first = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')
    first?.focus()
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function handleMenuKeyDown(event: ReactKeyboardEvent) {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
    const currentIndex = items.indexOf(document.activeElement as HTMLElement)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      items[(currentIndex + 1) % items.length]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      items[(currentIndex - 1 + items.length) % items.length]?.focus()
    }
  }

  const clonedTrigger = cloneElement(trigger, {
    ref: triggerRef,
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? menuId : undefined,
    onClick: (e: ReactMouseEvent) => {
      ;(trigger.props as { onClick?: (e: ReactMouseEvent) => void }).onClick?.(e)
      setIsOpen((prev) => !prev)
    },
  })

  return (
    <>
      {clonedTrigger}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            onKeyDown={handleMenuKeyDown}
            style={{ top: coords.top, [align === 'right' ? 'right' : 'left']: align === 'right' ? window.innerWidth - coords.left - coords.width : coords.left }}
            className="fixed z-50 min-w-[180px] animate-fade-in rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            {Children.map(children, (child) => {
              if (!isValidElement(child)) return child
              const el = child as ReactElement<{ onClick?: () => void }>
              return cloneElement(el, {
                onClick: () => {
                  el.props.onClick?.()
                  setIsOpen(false)
                },
              })
            })}
          </div>,
          document.body,
        )}
    </>
  )
}

export function DropdownItem({
  children,
  onClick,
  destructive,
  icon,
}: {
  children: ReactNode
  onClick?: () => void
  destructive?: boolean
  icon?: ReactNode
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cx(
        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm outline-none',
        'hover:bg-slate-100 focus-visible:bg-slate-100 dark:hover:bg-slate-700 dark:focus-visible:bg-slate-700',
        destructive ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200',
      )}
    >
      {icon}
      {children}
    </button>
  )
}

export function DropdownSeparator() {
  return <div role="separator" className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
}
