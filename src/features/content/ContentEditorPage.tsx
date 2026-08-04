import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Trash2,
  MoreHorizontal,
  Copy,
  Eye,
  ChevronDown,
  ChevronUp,
  LayoutTemplate,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Field } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { MediaThumb } from '../../components/ui/MediaThumb'
import { MediaPickerModal } from '../../components/ui/MediaPickerModal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Dropdown, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown'
import { slugify, wordCount, readingTime, formatDateTime } from '../../lib/utils'
import type { ContentItem, ContentStatus } from '../../lib/types'

type SaveState = 'idle' | 'saving' | 'saved'

export function ContentEditorPage() {
  const { typeSlug, id } = useParams<{ typeSlug: string; id: string }>()
  const navigate = useNavigate()
  const { getContentTypeBySlug, data, createContent, updateContent, deleteContent, getUser } = useData()
  const { showToast } = useToast()

  const contentType = getContentTypeBySlug(typeSlug ?? '')
  const createdRef = useRef(false)

  // "new" route: create a draft immediately, then redirect to its edit URL.
  useEffect(() => {
    if (id === 'new' && contentType && !createdRef.current) {
      createdRef.current = true
      const item = createContent(contentType.id, { title: 'Untitled', status: 'draft' })
      navigate(`/content/${contentType.slug}/${item.id}`, { replace: true })
    }
  }, [id, contentType, createContent, navigate])

  const item = useMemo(() => data.content.find((c) => c.id === id), [data.content, id])

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(true)
  const [excerpt, setExcerpt] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [featuredImageId, setFeaturedImageId] = useState<string | undefined>(undefined)
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [status, setStatus] = useState<ContentStatus>('draft')
  const [scheduledFor, setScheduledFor] = useState('')
  const [seoOpen, setSeoOpen] = useState(false)
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  const bodyRef = useRef<HTMLDivElement>(null)
  const hydrated = useRef(false)

  // Hydrate local form state once when the item first loads.
  useEffect(() => {
    if (!item || hydrated.current) return
    hydrated.current = true
    setTitle(item.title)
    setSlug(item.slug)
    setSlugTouched(Boolean(item.slug))
    setExcerpt(item.excerpt)
    setTagsInput(item.tags.join(', '))
    setFeaturedImageId(item.featuredImageId)
    setSeoTitle(item.seoTitle ?? '')
    setSeoDescription(item.seoDescription ?? '')
    setStatus(item.status)
    setScheduledFor(item.scheduledFor ? item.scheduledFor.slice(0, 16) : '')
    if (bodyRef.current) bodyRef.current.innerHTML = item.body || ''
  }, [item])

  const debounceRef = useRef<number | undefined>(undefined)
  const save = useCallback(
    (patch: Partial<ContentItem>) => {
      if (!id || id === 'new') return
      setSaveState('saving')
      window.clearTimeout(debounceRef.current)
      debounceRef.current = window.setTimeout(() => {
        updateContent(id, patch)
        setSaveState('saved')
      }, 500)
    },
    [id, updateContent],
  )

  useEffect(() => {
    if (!hydrated.current) return
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    save({
      title,
      slug,
      excerpt,
      tags,
      featuredImageId,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, slug, excerpt, tagsInput, featuredImageId, seoTitle, seoDescription])

  if (!contentType) return <Navigate to="/" replace />
  if (id === 'new') {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">Creating draft…</div>
    )
  }
  if (!item) return <Navigate to={`/content/${contentType.slug}`} replace />

  const author = getUser(item.authorId)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true)
    setSlug(slugify(value))
  }

  function handleBodyInput() {
    if (!bodyRef.current || !id) return
    save({ body: bodyRef.current.innerHTML })
  }

  function exec(command: string, value?: string) {
    bodyRef.current?.focus()
    document.execCommand(command, false, value)
    handleBodyInput()
  }

  function handleStatusChange(next: ContentStatus) {
    setStatus(next)
    if (!id) return
    const patch: Partial<ContentItem> = { status: next }
    if (next === 'published') patch.publishedAt = new Date().toISOString()
    if (next === 'scheduled' && scheduledFor) patch.scheduledFor = new Date(scheduledFor).toISOString()
    updateContent(id, patch)
    showToast({
      title: next === 'published' ? 'Published' : `Status changed to ${next.replace('-', ' ')}`,
      description: `"${title || 'Untitled'}" is now ${next.replace('-', ' ')}.`,
      variant: next === 'published' ? 'success' : 'info',
    })
  }

  function handleScheduleChange(value: string) {
    setScheduledFor(value)
    if (id && value) {
      updateContent(id, { scheduledFor: new Date(value).toISOString(), status: 'scheduled' })
      setStatus('scheduled')
    }
  }

  function handleDelete() {
    if (!id) return
    deleteContent(id)
    showToast({ title: 'Deleted', description: `"${title || 'Untitled'}" was deleted.`, variant: 'info' })
    navigate(`/content/${contentType!.slug}`)
  }

  function handleDuplicate() {
    const copy = createContent(contentType!.id, {
      title: `${title} (copy)`,
      slug: slug ? `${slug}-copy` : '',
      status: 'draft',
      excerpt,
      body: bodyRef.current?.innerHTML ?? '',
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      featuredImageId,
    })
    showToast({ title: 'Duplicated', variant: 'success' })
    navigate(`/content/${contentType!.slug}/${copy.id}`)
  }

  const featuredImage = data.media.find((m) => m.id === featuredImageId)
  const bodyText = bodyRef.current?.textContent ?? item.body.replace(/<[^>]+>/g, '')
  const categoryField = contentType.fields.find((f) => f.key === 'category')

  return (
    <div className="pb-16">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/content/${contentType.slug}`)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {contentType.pluralName}
        </button>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <StatusBadge status={item.status} />
        <span aria-live="polite" className="text-xs text-slate-400">
          {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? `Saved · updated ${formatDateTime(item.updatedAt)}` : ''}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="secondary"
            leftIcon={<LayoutTemplate className="h-4 w-4" aria-hidden="true" />}
            onClick={() => navigate(`/content/${contentType.slug}/${id}/builder`)}
          >
            Page builder
            {item.blocks && item.blocks.length > 0 && (
              <span className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {item.blocks.length}
              </span>
            )}
          </Button>
          {status !== 'published' ? (
            <Button variant="primary" onClick={() => handleStatusChange('published')}>
              Publish
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => handleStatusChange('draft')}>
              Unpublish
            </Button>
          )}
          <Dropdown
            trigger={
              <button
                type="button"
                aria-label="More actions"
                className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </button>
            }
          >
            <DropdownItem icon={<Copy className="h-4 w-4" aria-hidden="true" />} onClick={handleDuplicate}>
              Duplicate
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem icon={<Trash2 className="h-4 w-4" aria-hidden="true" />} destructive onClick={() => setConfirmDeleteOpen(true)}>
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Input
            aria-label="Title"
            placeholder="Untitled"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="h-auto rounded-lg border-0 bg-transparent px-2 -mx-2 text-3xl font-semibold tracking-tight shadow-none dark:bg-transparent"
          />
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <span>{contentType.slug}/</span>
            <input
              aria-label="Slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="url-slug"
              className="min-w-0 flex-1 rounded border-0 bg-transparent p-0 text-sm text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 p-2 dark:border-slate-800">
              <ToolbarButton icon={Bold} label="Bold" onClick={() => exec('bold')} />
              <ToolbarButton icon={Italic} label="Italic" onClick={() => exec('italic')} />
              <ToolbarButton icon={Underline} label="Underline" onClick={() => exec('underline')} />
              <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
              <ToolbarButton icon={List} label="Bulleted list" onClick={() => exec('insertUnorderedList')} />
              <ToolbarButton icon={ListOrdered} label="Numbered list" onClick={() => exec('insertOrderedList')} />
              <ToolbarButton
                icon={Link2}
                label="Insert link"
                onClick={() => {
                  const url = window.prompt('Link URL')
                  if (url) exec('createLink', url)
                }}
              />
              <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
              <ToolbarButton icon={Undo2} label="Undo" onClick={() => exec('undo')} />
              <ToolbarButton icon={Redo2} label="Redo" onClick={() => exec('redo')} />
              <span className="ml-auto text-xs text-slate-400">
                {wordCount(bodyText)} words · {readingTime(bodyText)}
              </span>
            </div>
            <div
              ref={bodyRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleBodyInput}
              role="textbox"
              aria-multiline="true"
              aria-label={`${contentType.name} body`}
              data-placeholder="Start writing…"
              className="prose-content min-h-[360px] px-5 py-4 text-[15px] leading-relaxed text-slate-800 focus-visible:outline-none dark:text-slate-200 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-brand-600 [&_a]:underline empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]"
            />
          </div>

          <details open={seoOpen} onToggle={(e) => setSeoOpen((e.target as HTMLDetailsElement).open)} className="rounded-xl border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-sm font-semibold text-slate-900 dark:text-white">
              Search engine preview
              {seoOpen ? <ChevronUp className="h-4 w-4 text-slate-400" aria-hidden="true" /> : <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            </summary>
            <div className="space-y-4 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="truncate text-sm text-brand-700 dark:text-brand-400">
                  atlascms.dev/{contentType.slug}/{slug || 'url-slug'}
                </p>
                <p className="truncate text-base text-blue-800 dark:text-blue-400">{seoTitle || title || 'Untitled'}</p>
                <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {seoDescription || excerpt || 'Add a description to control how this appears in search results.'}
                </p>
              </div>
              <Field label="SEO title" htmlFor="seo-title" helpText={`${seoTitle.length}/60 characters`}>
                <Input id="seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} />
              </Field>
              <Field label="Meta description" htmlFor="seo-desc" helpText={`${seoDescription.length}/160 characters`}>
                <Textarea id="seo-desc" rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} maxLength={180} />
              </Field>
            </div>
          </details>
        </div>

        <aside className="space-y-4">
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <Field label="Status" htmlFor="status">
              <Select id="status" value={status} onChange={(e) => handleStatusChange(e.target.value as ContentStatus)}>
                <option value="draft">Draft</option>
                <option value="in-review">In review</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>

            {status === 'scheduled' && (
              <Field label="Publish date" htmlFor="scheduled-for" helpText="Content will publish automatically at this time.">
                <Input id="scheduled-for" type="datetime-local" value={scheduledFor} onChange={(e) => handleScheduleChange(e.target.value)} />
              </Field>
            )}

            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Author</p>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <Avatar name={author?.name ?? '?'} gradient={author?.avatarColor} size="xs" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{author?.name ?? 'Unknown'}</span>
              </div>
            </div>

            {categoryField && (
              <Field label="Category" htmlFor="category">
                <Select id="category" defaultValue="">
                  <option value="">Select a category</option>
                  {categoryField.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            <Field label="Tags" htmlFor="tags" helpText="Comma-separated">
              <Input id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="design, product" />
            </Field>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured image</p>
            {featuredImage ? (
              <div className="space-y-2">
                <MediaThumb item={featuredImage} className="aspect-video w-full" />
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{featuredImage.filename}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => setImagePickerOpen(true)}>
                    Change
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setFeaturedImageId(undefined)}>
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setImagePickerOpen(true)}
                className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-brand-400 hover:text-brand-500 dark:border-slate-700"
              >
                <ImageIcon className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-medium">Select image</span>
              </button>
            )}
          </div>

          <Field label="Excerpt" htmlFor="excerpt" helpText="Shown in listings and social previews">
            <Textarea id="excerpt" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </Field>

          <a
            href={`#preview-${item.id}`}
            onClick={(e) => {
              e.preventDefault()
              showToast({ title: 'Preview', description: 'Preview rendering is not wired up in this prototype.', variant: 'info' })
            }}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Preview
          </a>
        </aside>
      </div>

      <MediaPickerModal
        isOpen={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelect={setFeaturedImageId}
        title="Select a featured image"
      />

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete this item?"
        description="This action can't be undone. The item will be permanently removed."
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Bold
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}
