import { Compass } from 'lucide-react'
import { LinkButton } from '../components/ui/LinkButton'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Compass className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
      </p>
      <LinkButton to="/" className="mt-5">
        Back to dashboard
      </LinkButton>
    </div>
  )
}
