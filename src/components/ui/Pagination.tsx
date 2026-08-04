import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

export function Pagination({
  page,
  pageCount,
  onPageChange,
  totalItems,
  pageSize,
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  totalItems: number
  pageSize: number
}) {
  if (totalItems === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row dark:border-slate-800"
    >
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-300">{start}–{end}</span> of{' '}
        <span className="font-medium text-slate-700 dark:text-slate-300">{totalItems}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          leftIcon={<ChevronLeft className="h-4 w-4" aria-hidden="true" />}
        >
          Previous
        </Button>
        <span className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
          Page {page} of {pageCount}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          rightIcon={<ChevronRight className="h-4 w-4" aria-hidden="true" />}
        >
          Next
        </Button>
      </div>
    </nav>
  )
}
