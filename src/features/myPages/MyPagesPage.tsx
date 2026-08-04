import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  FileStack,
  Clock,
  CheckCircle2,
  PenLine,
  Send,
  ThumbsUp,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { StatCard } from '../../components/ui/StatCard'
import { StatusBadge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { LinkButton } from '../../components/ui/LinkButton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Tabs } from '../../components/ui/Tabs'
import { Dropdown, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { timeAgo } from '../../lib/utils'
import type { ContentItem } from '../../lib/types'

export function MyPagesPage() {
  const { data, currentUser, getUser, getContentTypeBySlug, updateContent, deleteContent, logActivity } = useData()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [scope, setScope] = useState<'mine' | 'all'>('mine')
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const pageType = getContentTypeBySlug('pages')

  const allPages = useMemo(
    () => (pageType ? data.content.filter((c) => c.contentTypeId === pageType.id) : []),
    [data.content, pageType],
  )
  const myPages = useMemo(() => allPages.filter((c) => c.authorId === currentUser.id), [allPages, currentUser.id])

  if (!pageType) return <Navigate to="/" replace />

  const canReview = currentUser.role === 'Admin' || currentUser.role === 'Editor'

  const needsApprovalCount = myPages.filter((c) => c.status === 'in-review').length
  const publishedCount = myPages.filter((c) => c.status === 'published').length
  const draftCount = myPages.filter((c) => c.status === 'draft').length

  const pendingReviewQueue = allPages.filter((c) => c.status === 'in-review' && c.authorId !== currentUser.id)

  let visible = scope === 'mine' ? myPages : allPages
  if (search.trim()) {
    const q = search.toLowerCase()
    visible = visible.filter((c) => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
  }
  const sorted = [...visible].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  function handleSubmitForReview(item: ContentItem) {
    updateContent(item.id, { status: 'in-review' })
    logActivity({ kind: 'updated', message: `submitted "${item.title}" for review`, targetId: item.id })
    showToast({ title: 'Submitted for review', description: `"${item.title}" is waiting on an Editor or Admin.`, variant: 'info' })
  }

  function handleApprove(item: ContentItem) {
    updateContent(item.id, { status: 'published', publishedAt: new Date().toISOString() })
    logActivity({ kind: 'published', message: `approved and published "${item.title}"`, targetId: item.id })
    showToast({ title: 'Approved & published', description: `"${item.title}" is now live.`, variant: 'success' })
  }

  function handleDelete(id: string) {
    const item = data.content.find((c) => c.id === id)
    deleteContent(id)
    setConfirmDeleteId(null)
    showToast({ title: 'Deleted', description: item ? `"${item.title}" was deleted.` : undefined, variant: 'info' })
  }

  const target = data.content.find((c) => c.id === confirmDeleteId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">My Pages</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Pages you&rsquo;ve created, and where each one stands in the review pipeline.
          </p>
        </div>
        <LinkButton to="/content/pages/new" leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>
          New page
        </LinkButton>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My pages" value={myPages.length} icon={<FileStack className="h-5 w-5" aria-hidden="true" />} accent="brand" />
        <StatCard label="Needs approval" value={needsApprovalCount} icon={<Clock className="h-5 w-5" aria-hidden="true" />} accent="amber" />
        <StatCard label="Published" value={publishedCount} icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />} accent="emerald" />
        <StatCard label="Drafts" value={draftCount} icon={<PenLine className="h-5 w-5" aria-hidden="true" />} accent="violet" />
      </div>

      {canReview && pendingReviewQueue.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-500/5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {pendingReviewQueue.length} page{pendingReviewQueue.length === 1 ? '' : 's'} from your team {pendingReviewQueue.length === 1 ? 'is' : 'are'} waiting on your review
            </p>
          </div>
          <ul className="mt-2 space-y-1">
            {pendingReviewQueue.map((item) => {
              const author = getUser(item.authorId)
              return (
                <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <Link to={`/content/pages/${item.id}`} className="truncate text-amber-900 hover:underline dark:text-amber-200">
                    {item.title} <span className="text-amber-700/70 dark:text-amber-400/70">— {author?.name}</span>
                  </Link>
                  <Button size="sm" variant="secondary" leftIcon={<ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />} onClick={() => handleApprove(item)}>
                    Approve
                  </Button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <Tabs
            tabs={[
              { id: 'mine', label: 'My pages', badge: <span className="ml-1 text-xs text-slate-400">({myPages.length})</span> },
              { id: 'all', label: 'All pages', badge: <span className="ml-1 text-xs text-slate-400">({allPages.length})</span> },
            ]}
            activeId={scope}
            onChange={(id) => setScope(id as 'mine' | 'all')}
          />
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search pages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search pages"
            />
          </div>
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            icon={<FileStack className="h-6 w-6" aria-hidden="true" />}
            title={scope === 'mine' ? "You haven't created any pages yet" : 'No pages found'}
            description={
              scope === 'mine'
                ? 'Create your first page and it will show up here with its review status.'
                : 'Try a different search, or switch to "My pages".'
            }
            action={
              scope === 'mine' ? (
                <LinkButton to="/content/pages/new" leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>
                  New page
                </LinkButton>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">
                {scope === 'mine' ? 'Pages you created' : 'All pages'}
              </caption>
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                  <th scope="col" className="px-5 py-3 font-medium">Title</th>
                  <th scope="col" className="px-2 py-3 font-medium">Status</th>
                  {scope === 'all' && <th scope="col" className="px-2 py-3 font-medium">Author</th>}
                  <th scope="col" className="px-2 py-3 font-medium">Updated</th>
                  <th scope="col" className="w-10 px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sorted.map((item) => {
                  const author = getUser(item.authorId)
                  const isMine = item.authorId === currentUser.id
                  return (
                    <tr key={item.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-3">
                        <Link to={`/content/pages/${item.id}`} className="font-medium text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400">
                          {item.title || 'Untitled'}
                        </Link>
                        <p className="text-xs text-slate-400">/{item.slug || '(no slug)'}</p>
                      </td>
                      <td className="px-2 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      {scope === 'all' && (
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={author?.name ?? '?'} gradient={author?.avatarColor} size="xs" />
                            <span className="text-slate-600 dark:text-slate-300">{author?.name}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-2 py-3 text-slate-500 dark:text-slate-400">{timeAgo(item.updatedAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {isMine && item.status === 'draft' && (
                            <Button size="sm" variant="secondary" leftIcon={<Send className="h-3.5 w-3.5" aria-hidden="true" />} onClick={() => handleSubmitForReview(item)}>
                              Submit for review
                            </Button>
                          )}
                          {canReview && item.status === 'in-review' && (
                            <Button size="sm" variant="secondary" leftIcon={<ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />} onClick={() => handleApprove(item)}>
                              Approve
                            </Button>
                          )}
                          <Dropdown
                            trigger={
                              <button
                                type="button"
                                aria-label={`Actions for ${item.title || 'Untitled'}`}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                              >
                                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                              </button>
                            }
                          >
                            <DropdownItem icon={<Pencil className="h-4 w-4" aria-hidden="true" />} onClick={() => navigate(`/content/pages/${item.id}`)}>
                              Edit
                            </DropdownItem>
                            <DropdownItem icon={<Eye className="h-4 w-4" aria-hidden="true" />} onClick={() => window.open(`/content/pages/${item.id}/preview`, '_blank', 'noopener,noreferrer')}>
                              Preview
                            </DropdownItem>
                            <DropdownSeparator />
                            <DropdownItem icon={<Trash2 className="h-4 w-4" aria-hidden="true" />} destructive onClick={() => setConfirmDeleteId(item.id)}>
                              Delete
                            </DropdownItem>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title="Delete this page?"
        description={`"${target?.title ?? 'This page'}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}
