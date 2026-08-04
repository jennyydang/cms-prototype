import { Link } from 'react-router-dom'
import {
  FileStack,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { StatCard } from '../../components/ui/StatCard'
import { Avatar } from '../../components/ui/Avatar'
import { StatusBadge } from '../../components/ui/Badge'
import { LinkButton } from '../../components/ui/LinkButton'
import { timeAgo, formatDate } from '../../lib/utils'
import type { ContentStatus } from '../../lib/types'

const STATUS_ORDER: ContentStatus[] = ['draft', 'in-review', 'scheduled', 'published', 'archived']
const STATUS_COLOR: Record<ContentStatus, string> = {
  draft: 'bg-slate-400',
  'in-review': 'bg-amber-400',
  scheduled: 'bg-violet-400',
  published: 'bg-emerald-500',
  archived: 'bg-slate-300',
}
const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: 'Draft',
  'in-review': 'In review',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
}

export function DashboardPage() {
  const { data, currentUser, getUser, getContentType } = useData()

  const total = data.content.length
  const published = data.content.filter((c) => c.status === 'published').length
  const needsAttention = data.content.filter((c) => c.status === 'draft' || c.status === 'in-review').length
  const scheduled = data.content.filter((c) => c.status === 'scheduled')

  const recentActivity = data.activity.slice(0, 8)
  const recentContent = [...data.content]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const statusCounts = STATUS_ORDER.map((status) => ({
    status,
    count: data.content.filter((c) => c.status === status).length,
  }))

  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {greeting}, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here&rsquo;s what&rsquo;s happening across your content today.
          </p>
        </div>
        <div className="flex gap-2">
          <LinkButton to="/content/posts" variant="secondary" leftIcon={<FileStack className="h-4 w-4" aria-hidden="true" />}>
            View all content
          </LinkButton>
          <LinkButton to="/content/posts/new" leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>
            New content
          </LinkButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total content" value={total} icon={<FileStack className="h-5 w-5" aria-hidden="true" />} accent="brand" />
        <StatCard label="Published" value={published} icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />} accent="emerald" />
        <StatCard label="Needs attention" value={needsAttention} icon={<Clock className="h-5 w-5" aria-hidden="true" />} accent="amber" />
        <StatCard label="Media assets" value={data.media.length} icon={<ImageIcon className="h-5 w-5" aria-hidden="true" />} accent="violet" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recently updated</h2>
              <Link to="/content/posts" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentContent.map((item) => {
                const type = getContentType(item.contentTypeId)
                const author = getUser(item.authorId)
                return (
                  <li key={item.id}>
                    <Link
                      to={`/content/${type?.slug}/${item.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          {type?.name} · updated {timeAgo(item.updatedAt)} by {author?.name}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Content by status</h2>
            <div className="mt-4 space-y-3">
              {statusCounts.map(({ status, count }) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-medium text-slate-600 dark:text-slate-400">
                    {STATUS_LABEL[status]}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${STATUS_COLOR[status]}`}
                      style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Activity feed</h2>
            </div>
            <ul className="max-h-96 space-y-4 overflow-y-auto px-5 py-4">
              {recentActivity.map((entry) => {
                const actor = getUser(entry.actorId)
                return (
                  <li key={entry.id} className="flex gap-3">
                    <Avatar name={actor?.name ?? '?'} gradient={actor?.avatarColor} size="xs" className="mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium text-slate-900 dark:text-white">{actor?.name}</span>{' '}
                        {entry.message}
                      </p>
                      <p className="text-xs text-slate-400">{timeAgo(entry.timestamp)}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          {scheduled.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Scheduled to publish</h2>
              </div>
              <ul className="mt-3 space-y-2.5">
                {scheduled.map((item) => {
                  const type = getContentType(item.contentTypeId)
                  return (
                    <li key={item.id}>
                      <Link
                        to={`/content/${type?.slug}/${item.id}`}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <span className="truncate font-medium text-slate-700 dark:text-slate-300">{item.title}</span>
                        <span className="shrink-0 text-xs text-slate-400">{formatDate(item.scheduledFor)}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
