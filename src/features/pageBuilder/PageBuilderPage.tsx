import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Eye,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  LayoutTemplate,
  PanelTop,
  AlignLeft,
  Image as ImageIcon,
  Columns2,
  Quote,
  MousePointerClick,
  MoveVertical,
  PanelBottom,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { blockRegistry, createBlock } from '../../lib/blocks'
import { cx } from '../../lib/utils'
import type { BlockFieldValue, PageBlock, PageBlockType } from '../../lib/types'
import { BlockPreview } from './BlockPreview'
import { BlockInspector } from './BlockInspector'

const paletteIcons: Record<string, LucideIcon> = {
  PanelTop,
  AlignLeft,
  Image: ImageIcon,
  Columns2,
  Quote,
  MousePointerClick,
  MoveVertical,
  PanelBottom,
  LayoutGrid,
}

const paletteSections: { label: string; hint: string; category: 'content' | 'widget' }[] = [
  { label: 'Content blocks', hint: 'Single-purpose building blocks.', category: 'content' },
  { label: 'Widgets', hint: 'Pre-composed, purpose-built sections.', category: 'widget' },
]

type SaveState = 'idle' | 'saving' | 'saved'

export function PageBuilderPage() {
  const { typeSlug, id } = useParams<{ typeSlug: string; id: string }>()
  const navigate = useNavigate()
  const { data, getContentTypeBySlug, updateContent } = useData()
  const { showToast } = useToast()

  const contentType = getContentTypeBySlug(typeSlug ?? '')
  const item = useMemo(() => data.content.find((c) => c.id === id), [data.content, id])

  const [blocks, setBlocks] = useState<PageBlock[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const draggingBlockId = useRef<string | null>(null)
  const draggingPaletteType = useRef<PageBlockType | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  const hydrated = useRef(false)
  useEffect(() => {
    if (!item || hydrated.current) return
    hydrated.current = true
    setBlocks(item.blocks ?? [])
  }, [item])

  const debounceRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (!hydrated.current || !id) return
    setSaveState('saving')
    window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      updateContent(id, { blocks })
      setSaveState('saved')
    }, 500)
    return () => window.clearTimeout(debounceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks])

  if (!contentType) return <Navigate to="/" replace />
  if (!item) return <Navigate to={`/content/${contentType.slug}`} replace />

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null

  function resetDrag() {
    draggingBlockId.current = null
    draggingPaletteType.current = null
    setDragOverIndex(null)
  }

  function commitDrop(index: number) {
    if (draggingPaletteType.current) {
      const newBlock = createBlock(draggingPaletteType.current)
      setBlocks((prev) => {
        const next = [...prev]
        next.splice(index, 0, newBlock)
        return next
      })
      setSelectedId(newBlock.id)
    } else if (draggingBlockId.current) {
      const draggedId = draggingBlockId.current
      setBlocks((prev) => {
        const from = prev.findIndex((b) => b.id === draggedId)
        if (from === -1) return prev
        const next = [...prev]
        const [moved] = next.splice(from, 1)
        const adjusted = from < index ? index - 1 : index
        next.splice(adjusted, 0, moved)
        return next
      })
    }
    resetDrag()
  }

  function handleBlockDragOver(e: DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = draggingPaletteType.current ? 'copy' : 'move'
    const rect = e.currentTarget.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    setDragOverIndex(e.clientY < midpoint ? index : index + 1)
  }

  function appendBlock(type: PageBlockType) {
    const newBlock = createBlock(type)
    setBlocks((prev) => [...prev, newBlock])
    setSelectedId(newBlock.id)
  }

  function moveBlock(blockId: string, direction: -1 | 1) {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === blockId)
      const target = index + direction
      if (index === -1 || target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function duplicateBlock(blockId: string) {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === blockId)
      if (index === -1) return prev
      const copy: PageBlock = { ...prev[index], id: `${prev[index].id}_${Math.random().toString(36).slice(2, 6)}` }
      const next = [...prev]
      next.splice(index + 1, 0, copy)
      return next
    })
  }

  function deleteBlock(blockId: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId))
    if (selectedId === blockId) setSelectedId(null)
  }

  function updateBlockData(blockId: string, data: Record<string, BlockFieldValue>) {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, data } : b)))
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/content/${contentType.slug}/${id}`)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to editor
        </button>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          <LayoutTemplate className="h-4 w-4 text-slate-400" aria-hidden="true" />
          {item.title || 'Untitled'}
        </span>
        <span aria-live="polite" className="text-xs text-slate-400">
          {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : ''}
        </span>
        <Link
          to={`/content/${contentType.slug}/${id}/preview`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          Preview
          <span className="sr-only"> (opens in a new tab)</span>
        </Link>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[240px_1fr_320px]">
        {/* Palette */}
        <div className="overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-panel dark:border-slate-800 dark:bg-slate-900 lg:h-full">
          <p className="px-1 pb-3 text-xs text-slate-400">Drag onto the page, or click to add.</p>
          <div className="space-y-5">
            {paletteSections.map((section) => {
              const defs = blockRegistry.filter((def) => def.category === section.category)
              if (defs.length === 0) return null
              return (
                <div key={section.category}>
                  <p className="px-1 pb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{section.label}</p>
                  <p className="px-1 pb-2 text-[11px] text-slate-400">{section.hint}</p>
                  <div className="space-y-1.5">
                    {defs.map((def) => {
                      const Icon = paletteIcons[def.icon] ?? PanelTop
                      return (
                        <div
                          key={def.type}
                          draggable
                          role="button"
                          tabIndex={0}
                          aria-label={`Add ${def.label} block`}
                          onDragStart={(e) => {
                            draggingPaletteType.current = def.type
                            e.dataTransfer.effectAllowed = 'copy'
                            e.dataTransfer.setData('text/plain', def.type)
                          }}
                          onDragEnd={resetDrag}
                          onClick={() => appendBlock(def.type)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              appendBlock(def.type)
                            }
                          }}
                          className="flex cursor-grab items-start gap-2.5 rounded-lg border border-slate-200 p-2.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/50 active:cursor-grabbing dark:border-slate-800 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10"
                        >
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">{def.label}</span>
                            <span className="block text-xs text-slate-400">{def.description}</span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Canvas */}
        <div className="min-h-0 overflow-y-auto rounded-xl border border-slate-200 bg-slate-100 p-6 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="mx-auto max-w-2xl rounded-xl bg-white shadow-panel dark:bg-slate-900">
            {blocks.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverIndex(0)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  commitDrop(0)
                }}
              >
                <EmptyState
                  icon={<LayoutTemplate className="h-6 w-6" aria-hidden="true" />}
                  title="This page is empty"
                  description="Drag a block from the left, or click one to add it here."
                />
              </div>
            ) : (
              <div className="py-2">
                {blocks.map((b, index) => (
                  <div key={b.id}>
                    <InsertionLine active={dragOverIndex === index} />
                    <div
                      onDragOver={(e) => handleBlockDragOver(e, index)}
                      onDrop={(e) => {
                        e.preventDefault()
                        commitDrop(dragOverIndex ?? index)
                      }}
                      onClick={() => setSelectedId(b.id)}
                      className={cx(
                        'group relative cursor-pointer border-2 transition-colors',
                        selectedId === b.id ? 'border-brand-400' : 'border-transparent hover:border-brand-200 dark:hover:border-brand-500/30',
                      )}
                    >
                      <div className="pointer-events-none absolute -top-3 left-3 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        <div className="pointer-events-auto flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                          <button
                            type="button"
                            draggable
                            onDragStart={(e) => {
                              draggingBlockId.current = b.id
                              e.dataTransfer.effectAllowed = 'move'
                              e.dataTransfer.setData('text/plain', b.id)
                            }}
                            onDragEnd={resetDrag}
                            aria-label={`Drag to reorder ${blockRegistry.find((d) => d.type === b.type)?.label}`}
                            className="cursor-grab rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing dark:hover:bg-slate-700 dark:hover:text-slate-200"
                          >
                            <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveBlock(b.id, -1)
                            }}
                            disabled={index === 0}
                            aria-label="Move block up"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                          >
                            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveBlock(b.id, 1)
                            }}
                            disabled={index === blocks.length - 1}
                            aria-label="Move block down"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                          >
                            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateBlock(b.id)
                            }}
                            aria-label="Duplicate block"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                          >
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteBlock(b.id)
                            }}
                            aria-label="Delete block"
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <BlockPreview block={b} />
                    </div>
                  </div>
                ))}
                <InsertionLine active={dragOverIndex === blocks.length} />
              </div>
            )}
          </div>
        </div>

        {/* Inspector */}
        <div className="overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900 lg:h-full">
          {selectedBlock ? (
            <BlockInspector block={selectedBlock} onChange={(newData) => updateBlockData(selectedBlock.id, newData)} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-2 py-10 text-center">
              <LayoutTemplate className="h-6 w-6 text-slate-300 dark:text-slate-600" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">No block selected</p>
              <p className="mt-1 text-xs text-slate-400">Click a block on the page to edit its content here.</p>
            </div>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-3 self-end text-slate-400"
        onClick={() => {
          navigate(`/content/${contentType.slug}/${id}`)
          showToast({ title: 'Layout saved', variant: 'success' })
        }}
      >
        Done editing layout
      </Button>
    </div>
  )
}

function InsertionLine({ active }: { active: boolean }) {
  return (
    <div className={cx('mx-4 rounded-full transition-all', active ? 'my-1 h-1.5 bg-brand-500' : 'h-0')} />
  )
}
