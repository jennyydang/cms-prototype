import type { ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './Button'

interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  className?: string
}

/** A react-router Link styled identically to <Button>, for navigation CTAs. */
export function LinkButton({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {leftIcon && <span className="-ml-0.5 shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="-mr-0.5 shrink-0">{rightIcon}</span>}
    </Link>
  )
}
