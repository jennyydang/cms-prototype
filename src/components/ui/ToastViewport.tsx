import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { useToast, type Toast, type ToastVariant } from '../../context/ToastContext'
import { cx } from '../../lib/utils'

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'text-emerald-600 dark:text-emerald-400' },
  error: { icon: AlertTriangle, classes: 'text-red-600 dark:text-red-400' },
  info: { icon: Info, classes: 'text-brand-600 dark:text-brand-400' },
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { icon: Icon, classes } = variantConfig[toast.variant]
  return (
    <div
      role="status"
      className="flex w-80 animate-toast-in items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <Icon className={cx('h-5 w-5 shrink-0', classes)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-700"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast()

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastCard toast={toast} onDismiss={() => dismissToast(toast.id)} />
        </div>
      ))}
    </div>
  )
}
