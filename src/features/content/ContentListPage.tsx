import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  Plus,
  Search,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  CheckCircle2,
  ArrowUpDown,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { LinkButton } from '../../components/ui/LinkButton'
import { Button } from '../../components/ui/Button'
import { Checkbox } from '../../components/ui/Checkbox'
import { StatusBadge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { Pagination } from '../../components/ui/Pagination'
import { Dropdown, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { timeAgo } from '../../lib/utils'
import type { ContentStatus } from '../../lib/types'

const PAGE_SIZE = 8

type SortKey = 'updated' | 'title' | 'created'

export function ContentListPage() {
  const { typeSlug } = useParams<{ typeSlug: string }>()
  const navigate = useNavigate()
  const { data, getContentTypeBySlug, getUser, deleteContent, bulkDeleteContent, bulkUpdateStatus, createContent } =
    useData()
  const { showToast } = useToast()

  const contentType = getContentTypeBySlug(typeSlug ?? '')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('updated')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  const items = useMemo(() => {
    if (!contentType) return []
    let list = data.content.filter((c) => c.contentTypeId === contentType.id)
    if (statusFilter !== 'all') list = list.filter((c) => c.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
    }
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'title') cmp = a.title.localeCompare(b.title)
      else if (sortKey === 'created') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      else cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [data.content, contentType, statusFilter, search, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (!contentType) {
    return <Navigate to="/" replace />
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAllOnPage() {
    setSelectedIds((prev) => {
      const allSelected = pageItems.every((item) => prev.has(item.id))
      const next = new Set(prev)
      pageItems.forEach((item) => (allSelected ? next.delete(item.id) : next.add(item.id)))
      return next
    })
  }

  function handleDuplicate(id: string) {
    const item = data.content.find((c) => c.id === id)
    if (!item) return
    createContent(contentType!.id, {
      title: `${item.title} (copy)`,
      slug: `${item.slug}-copy`,
      status: 'draft',
      excerpt: item.excerpt,
      body: item.body,
      tags: item.tags,
      featuredImageId: item.featuredImageId,
    })
    showToast({ title: 'Duplicated', description: `Created a draft copy of "${item.title}".`, variant: 'success' })
  }

  function handleDelete(id: string) {
    const item = data.content.find((c) => c.id === id)
    deleteContent(id)
    setConfirmDeleteId(null)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    showToast({ title: 'Deleted', description: item ? `"${item.title}" was deleted.` : undefined, variant: 'info' })
  }

  function handleBulkDelete() {
    bulkDeleteContent([...selectedIds])
    showToast({ title: `Deleted ${selectedIds.size} item${selectedIds.size === 1 ? '' : 's'}`, variant: 'info' })
    setSelectedIds(new Set())
    setConfirmBulkDelete(false)
  }

  function handleBulkPublish() {
    bulkUpdateStatus([...selectedIds], 'published')
    showToast({ title: `Published ${selectedIds.size} item${selectedIds.size === 1 ? '' : 's'}`, variant: 'success' })
    setSelectedIds(new Set())
  }

  const allOnPageSelected = pageItems.length > 0 && pageItems.every((item) => selectedIds.has(item.id))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {contentType.pluralName}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{contentType.description}</p>
        </div>
        <LinkButton to={`/content/${contentType.slug}/new`} leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>
          New {contentType.name}
        </LinkButton>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              type="search"
              placeholder={`Search ${contentType.pluralName.toLowerCase()}…`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
              aria-label={`Search ${contentType.pluralName}`}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ContentStatus | 'all')
              setPage(1)
            }}
            aria-label="Filter by status"
            className="sm:w-48"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="in-review">In review</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-brand-100 bg-brand-50 px-4 py-2.5 dark:border-brand-500/20 dark:bg-brand-500/10">
            <span className="text-sm font-medium text-brand-800 dark:text-brand-300">
              {selectedIds.size} selected
            </span>
            <Button size="sm" variant="secondary" leftIcon={<CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />} onClick={handleBulkPublish}>
              Publish
            </Button>
            <Button size="sm" variant="secondary" leftIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />} onClick={() => setConfirmBulkDelete(true)}>
              Delete
            </Button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
            >
              Clear selection
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" aria-hidden="true" />}
            title={data.content.some((c) => c.contentTypeId === contentType.id) ? 'No matches found' : `No ${contentType.pluralName.toLowerCase()} yet`}
            description={
              data.content.some((c) => c.contentTypeId === contentType.id)
                ? 'Try adjusting your search or status filter.'
                : `Create your first ${contentType.name.toLowerCase()} to get started.`
            }
            action={
              <LinkButton to={`/content/${contentType.slug}/new`} leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>
                New {contentType.name}
              </LinkButton>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <caption className="sr-only">{contentType.pluralName} list</caption>
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                  <th scope="col" className="w-10 px-4 py-3">
                    <Checkbox
                      aria-label="Select all on this page"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAllOnPage}
                    />
                  </th>
                  <th scope="col" className="px-2 py-3 font-medium">
                    <button type="button" onClick={() => toggleSort('title')} className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300">
                      Title <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-3 font-medium">Status</th>
                  <th scope="col" className="px-2 py-3 font-medium">Author</th>
                  <th scope="col" className="px-2 py-3 font-medium">
                    <button type="button" onClick={() => toggleSort('updated')} className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300">
                      Updated <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </th>
                  <th scope="col" className="w-10 px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pageItems.map((item) => {
                  const author = getUser(item.authorId)
                  return (
                    <tr key={item.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <Checkbox
                          aria-label={`Select ${item.title}`}
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelected(item.id)}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <Link
                          to={`/content/${contentType.slug}/${item.id}`}
                          className="font-medium text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-slate-400">/{item.slug || '(no slug)'}</p>
                      </td>
                      <td className="px-2 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={author?.name ?? '?'} gradient={author?.avatarColor} size="xs" />
                          <span className="text-slate-600 dark:text-slate-300">{author?.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-slate-500 dark:text-slate-400">{timeAgo(item.updatedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Dropdown
                          trigger={
                            <button
                              type="button"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                              aria-label={`Actions for ${item.title}`}
                            >
                              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                            </button>
                          }
                        >
                          <DropdownItem icon={<Pencil className="h-4 w-4" aria-hidden="true" />} onClick={() => navigate(`/content/${contentType.slug}/${item.id}`)}>
                            Edit
                          </DropdownItem>
                          <DropdownItem icon={<Copy className="h-4 w-4" aria-hidden="true" />} onClick={() => handleDuplicate(item.id)}>
                            Duplicate
                          </DropdownItem>
                          <DropdownSeparator />
                          <DropdownItem
                            icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                            destructive
                            onClick={() => setConfirmDeleteId(item.id)}
                          >
                            Delete
                          </DropdownItem>
                        </Dropdown>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {items.length > 0 && (
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} totalItems={items.length} pageSize={PAGE_SIZE} />
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title="Delete this item?"
        description="This action can't be undone. The item will be permanently removed."
        confirmLabel="Delete"
        destructive
      />
      <ConfirmDialog
        isOpen={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedIds.size} item${selectedIds.size === 1 ? '' : 's'}?`}
        description="This action can't be undone. These items will be permanently removed."
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}
