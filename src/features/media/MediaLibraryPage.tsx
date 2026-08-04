import { useMemo, useRef, useState } from 'react'
import { Upload, Search, Image as ImageIcon, Trash2, Download } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Textarea } from '../../components/ui/Textarea'
import { EmptyState } from '../../components/ui/EmptyState'
import { MediaThumb } from '../../components/ui/MediaThumb'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Avatar } from '../../components/ui/Avatar'
import { formatBytes, formatDateTime } from '../../lib/utils'
import type { MediaItem, MediaKind } from '../../lib/types'

const GRADIENTS: [string, string][] = [
  ['#5570ff', '#3038d6'],
  ['#f59e0b', '#ea580c'],
  ['#10b981', '#0d9488'],
  ['#ec4899', '#be185d'],
  ['#8b5cf6', '#6d28d9'],
  ['#0ea5e9', '#0369a1'],
]

export function MediaLibraryPage() {
  const { data, addMedia, updateMedia, deleteMedia, getUser, updateContent } = useData()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [search, setSearch] = useState('')
  const [kindFilter, setKindFilter] = useState<MediaKind | 'all'>('all')
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [altDraft, setAltDraft] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const items = useMemo(() => {
    let list = data.media
    if (kindFilter !== 'all') list = list.filter((m) => m.kind === kindFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((m) => m.filename.toLowerCase().includes(q) || m.alt.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  }, [data.media, search, kindFilter])

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    Array.from(files).forEach((file) => {
      const kind: MediaKind = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document'
      const [colorFrom, colorTo] = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]

      const finish = (dataUrl?: string) => {
        addMedia({
          filename: file.name,
          kind,
          mime: file.type || 'application/octet-stream',
          sizeKb: Math.max(1, Math.round(file.size / 1024)),
          alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          colorFrom,
          colorTo,
          dataUrl,
        })
      }

      if (kind === 'image') {
        const reader = new FileReader()
        reader.onload = () => finish(typeof reader.result === 'string' ? reader.result : undefined)
        reader.readAsDataURL(file)
      } else {
        finish()
      }
    })
    showToast({ title: `Uploaded ${files.length} file${files.length === 1 ? '' : 's'}`, variant: 'success' })
  }

  function openDetail(item: MediaItem) {
    setSelected(item)
    setAltDraft(item.alt)
  }

  function saveAlt() {
    if (!selected) return
    updateMedia(selected.id, { alt: altDraft })
    showToast({ title: 'Alt text updated', variant: 'success' })
    setSelected(null)
  }

  function handleDelete(id: string) {
    const usedBy = data.content.filter((c) => c.featuredImageId === id)
    deleteMedia(id)
    usedBy.forEach((c) => updateContent(c.id, { featuredImageId: undefined }))
    setConfirmDeleteId(null)
    setSelected(null)
    showToast({ title: 'Deleted', description: usedBy.length ? `Removed from ${usedBy.length} item(s) using it.` : undefined, variant: 'info' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Media Library</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Images, documents, and video used across your content.
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
            aria-label="Upload files"
          />
          <Button leftIcon={<Upload className="h-4 w-4" aria-hidden="true" />} onClick={() => fileInputRef.current?.click()}>
            Upload
          </Button>
        </div>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        className="rounded-xl border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search media…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search media"
            />
          </div>
          <Select value={kindFilter} onChange={(e) => setKindFilter(e.target.value as MediaKind | 'all')} aria-label="Filter by kind" className="sm:w-44">
            <option value="all">All types</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
            <option value="video">Video</option>
          </Select>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<ImageIcon className="h-6 w-6" aria-hidden="true" />}
            title={data.media.length === 0 ? 'No media yet' : 'No matches found'}
            description={data.media.length === 0 ? 'Drag files here or click Upload to add your first asset.' : 'Try a different search or filter.'}
            action={
              data.media.length === 0 ? (
                <Button leftIcon={<Upload className="h-4 w-4" aria-hidden="true" />} onClick={() => fileInputRef.current?.click()}>
                  Upload files
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openDetail(item)}
                  className="group block w-full rounded-lg text-left focus-visible:outline-none"
                >
                  <MediaThumb item={item} className="aspect-square w-full ring-1 ring-slate-200 transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-brand-500 dark:ring-slate-700" />
                  <p className="mt-1.5 truncate text-xs font-medium text-slate-700 dark:text-slate-300">{item.filename}</p>
                  <p className="text-[11px] text-slate-400">{formatBytes(item.sizeKb)}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.filename ?? ''}
        size="lg"
        footer={
          selected && (
            <>
              <Button
                variant="secondary"
                leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                onClick={() => setConfirmDeleteId(selected.id)}
              >
                Delete
              </Button>
              <Button onClick={saveAlt}>Save changes</Button>
            </>
          )
        }
      >
        {selected && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <MediaThumb item={selected} className="aspect-square w-full" />
            <div className="space-y-4">
              <Field label="Alt text" htmlFor="alt-text" helpText="Describes the image for screen readers and SEO.">
                <Textarea id="alt-text" rows={3} value={altDraft} onChange={(e) => setAltDraft(e.target.value)} />
              </Field>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">Type</dt>
                  <dd className="text-slate-700 dark:text-slate-300">{selected.mime}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">Size</dt>
                  <dd className="text-slate-700 dark:text-slate-300">{formatBytes(selected.sizeKb)}</dd>
                </div>
                {selected.width && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Dimensions</dt>
                    <dd className="text-slate-700 dark:text-slate-300">
                      {selected.width} × {selected.height}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">Uploaded</dt>
                  <dd className="text-slate-700 dark:text-slate-300">{formatDateTime(selected.uploadedAt)}</dd>
                </div>
              </dl>
              <div className="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Avatar name={getUser(selected.uploadedById)?.name ?? '?'} gradient={getUser(selected.uploadedById)?.avatarColor} size="xs" />
                <span className="text-sm text-slate-600 dark:text-slate-300">{getUser(selected.uploadedById)?.name}</span>
              </div>
              <button
                type="button"
                onClick={() => showToast({ title: 'Not available in this prototype', description: 'Downloads are disabled for demo assets.', variant: 'info' })}
                className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download original
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title="Delete this file?"
        description="This will remove the file from the library and unlink it from any content using it."
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}
