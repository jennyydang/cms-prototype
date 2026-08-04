import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Blocks, FileStack, Layers, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { blockRegistry } from '../../lib/blocks'
import { blockIcons, defaultBlockIcon } from '../../lib/blockIcons'
import { StatCard } from '../../components/ui/StatCard'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { cx, timeAgo } from '../../lib/utils'
import type { ContentItem, PageBlockType } from '../../lib/types'

interface WidgetUsage {
  item: ContentItem
  contentTypeName: string
  contentTypeSlug: string
  count: number
}

export function WidgetManagerPage() {
  const { data, getContentType } = useData()

  const widgetDefs = useMemo(() => blockRegistry.filter((b) => b.category === 'widget'), [])

  const usageByType = useMemo(() => {
    const map = new Map<PageBlockType, WidgetUsage[]>()
    for (const def of widgetDefs) map.set(def.type, [])
    for (const item of data.content) {
      const blocks = item.blocks ?? []
      if (blocks.length === 0) continue
      const countsByType = new Map<PageBlockType, number>()
      for (const block of blocks) countsByType.set(block.type, (countsByType.get(block.type) ?? 0) + 1)
      for (const [type, count] of countsByType) {
        const list = map.get(type)
        if (!list) continue // a content block, not a widget — not tracked here
        const contentType = getContentType(item.contentTypeId)
        list.push({ item, contentTypeName: contentType?.name ?? 'Content', contentTypeSlug: contentType?.slug ?? '', count })
      }
    }
    return map
  }, [data.content, widgetDefs, getContentType])

  const [selectedType, setSelectedType] = useState<PageBlockType | undefined>(widgetDefs[0]?.type)
  const selectedDef = widgetDefs.find((d) => d.type === selectedType) ?? widgetDefs[0]
  const selectedUsages = selectedDef ? (usageByType.get(selectedDef.type) ?? []) : []
  const sortedUsages = [...selectedUsages].sort(
    (a, b) => new Date(b.item.updatedAt).getTime() - new Date(a.item.updatedAt).getTime(),
  )
  const selectedPlacementCount = selectedUsages.reduce((sum, u) => sum + u.count, 0)

  const totalWidgetTypes = widgetDefs.length
  const usedWidgetTypes = widgetDefs.filter((d) => (usageByType.get(d.type)?.length ?? 0) > 0).length
  const totalPlacements = [...usageByType.values()].reduce((sum, list) => sum + list.reduce((s, u) => s + u.count, 0), 0)
  const itemsUsingWidgets = new Set([...usageByType.values()].flat().map((u) => u.item.id)).size

  if (!selectedDef) {
    return (
      <EmptyState
        icon={<Blocks className="h-6 w-6" aria-hidden="true" />}
        title="No widgets registered"
        description="Widget types are defined in src/lib/blocks.ts."
      />
    )
  }

  const SelectedIcon = blockIcons[selectedDef.icon] ?? defaultBlockIcon

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Widget Manager</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          See which widgets are actually in use across your content, and jump straight to any page that uses one.
          Widgets are added from the Page Builder on any content item.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Widget types" value={totalWidgetTypes} icon={<Blocks className="h-5 w-5" aria-hidden="true" />} accent="brand" />
        <StatCard label="In use" value={`${usedWidgetTypes}/${totalWidgetTypes}`} icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />} accent="emerald" />
        <StatCard label="Total placements" value={totalPlacements} icon={<Layers className="h-5 w-5" aria-hidden="true" />} accent="violet" />
        <StatCard label="Pages using widgets" value={itemsUsingWidgets} icon={<FileStack className="h-5 w-5" aria-hidden="true" />} accent="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2">
          {widgetDefs.map((def) => {
            const Icon = blockIcons[def.icon] ?? defaultBlockIcon
            const usages = usageByType.get(def.type) ?? []
            const placements = usages.reduce((sum, u) => sum + u.count, 0)
            const active = def.type === selectedDef.type
            return (
              <button
                key={def.type}
                type="button"
                onClick={() => setSelectedType(def.type)}
                aria-current={active}
                className={cx(
                  'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors',
                  active
                    ? 'border-brand-300 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
                )}
              >
                <span
                  className={cx(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    active
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">{def.label}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {usages.length === 0 ? 'Not used yet' : `Used in ${usages.length} page${usages.length === 1 ? '' : 's'}`}
                  </span>
                </span>
                {placements > 0 && (
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {placements}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                <SelectedIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedDef.label}</h2>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{selectedDef.description}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>
                <strong className="font-semibold text-slate-800 dark:text-slate-200">{sortedUsages.length}</strong> page
                {sortedUsages.length === 1 ? '' : 's'}
              </span>
              <span>
                <strong className="font-semibold text-slate-800 dark:text-slate-200">{selectedPlacementCount}</strong> total placement
                {selectedPlacementCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Used in</h3>
            </div>
            {sortedUsages.length === 0 ? (
              <EmptyState
                icon={<SelectedIcon className="h-6 w-6" aria-hidden="true" />}
                title="Not used anywhere yet"
                description={`Add a ${selectedDef.label} block from the Page Builder on any content item, and it will show up here.`}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <caption className="sr-only">Content using the {selectedDef.label} widget</caption>
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                      <th scope="col" className="px-5 py-2.5 font-medium">Title</th>
                      <th scope="col" className="px-2 py-2.5 font-medium">Content type</th>
                      <th scope="col" className="px-2 py-2.5 font-medium">Status</th>
                      <th scope="col" className="px-2 py-2.5 font-medium">Placements</th>
                      <th scope="col" className="px-2 py-2.5 font-medium">Updated</th>
                      <th scope="col" className="w-10 px-5 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedUsages.map((usage) => (
                      <tr key={usage.item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-5 py-3">
                          <Link
                            to={`/content/${usage.contentTypeSlug}/${usage.item.id}/builder`}
                            className="font-medium text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                          >
                            {usage.item.title || 'Untitled'}
                          </Link>
                        </td>
                        <td className="px-2 py-3 text-slate-600 dark:text-slate-300">{usage.contentTypeName}</td>
                        <td className="px-2 py-3">
                          <StatusBadge status={usage.item.status} />
                        </td>
                        <td className="px-2 py-3 text-slate-600 dark:text-slate-300">{usage.count}×</td>
                        <td className="px-2 py-3 text-slate-500 dark:text-slate-400">{timeAgo(usage.item.updatedAt)}</td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            to={`/content/${usage.contentTypeSlug}/${usage.item.id}/builder`}
                            aria-label={`Open "${usage.item.title || 'Untitled'}" in the Page Builder`}
                            className="inline-flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                          >
                            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
