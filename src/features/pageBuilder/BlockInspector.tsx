import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Image as ImageIcon, Link2, Plus, Trash2 } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Switch } from '../../components/ui/Switch'
import { Button } from '../../components/ui/Button'
import { MediaThumb } from '../../components/ui/MediaThumb'
import { MediaPickerModal } from '../../components/ui/MediaPickerModal'
import { createRepeaterItem, getBlockTypeDef } from '../../lib/blocks'
import type { BlockFieldDef, BlockFieldValue, PageBlock, RepeaterItem, SharedWidget } from '../../lib/types'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asItems(value: unknown): RepeaterItem[] {
  return Array.isArray(value) ? value : []
}

/** Combines a field's accessibility/guidance copy with a live "x/N characters" counter. */
function combinedHelp(field: BlockFieldDef, value: string): string | undefined {
  const counter = field.maxLength ? `${value.length}/${field.maxLength} characters` : undefined
  const parts = [field.helpText, counter].filter(Boolean)
  return parts.length ? parts.join(' — ') : undefined
}

/**
 * Generic edit form for a block, rendered from its BlockTypeDef field
 * list. `data`/`onChange` are the *effective* content and setter — the
 * caller (PageBuilderPage) routes these to either the block's own local
 * data or a shared widget's data, depending on whether the block is
 * linked, so this component never needs to know which.
 */
export function BlockInspector({
  block,
  data,
  onChange,
  sharedWidget,
  usageCount,
  onMakeReusable,
  onUnlink,
  onRename,
}: {
  block: PageBlock
  data: Record<string, BlockFieldValue>
  onChange: (data: Record<string, BlockFieldValue>) => void
  sharedWidget?: SharedWidget
  usageCount: number
  onMakeReusable: (name: string) => void
  onUnlink: () => void
  onRename: (name: string) => void
}) {
  const def = getBlockTypeDef(block.type)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{def.label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{def.description}</p>
      </div>

      {def.category === 'widget' && (
        <ReusableWidgetPanel
          label={def.label}
          sharedWidget={sharedWidget}
          usageCount={usageCount}
          onMakeReusable={onMakeReusable}
          onUnlink={onUnlink}
          onRename={onRename}
        />
      )}

      {def.fields.map((field) => {
        if (field.input === 'repeater') {
          const items = asItems(data[field.key])

          function setItems(next: RepeaterItem[]) {
            onChange({ ...data, [field.key]: next })
          }

          return (
            <div key={field.key}>
              <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</p>
              <div className="space-y-2.5">
                {items.map((item, index) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {field.itemLabel ?? 'Item'} {index + 1}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (index === 0) return
                            const next = [...items]
                            ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                            setItems(next)
                          }}
                          disabled={index === 0}
                          aria-label={`Move ${field.itemLabel ?? 'item'} ${index + 1} up`}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                        >
                          <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (index === items.length - 1) return
                            const next = [...items]
                            ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
                            setItems(next)
                          }}
                          disabled={index === items.length - 1}
                          aria-label={`Move ${field.itemLabel ?? 'item'} ${index + 1} down`}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                        >
                          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                          aria-label={`Remove ${field.itemLabel ?? 'item'} ${index + 1}`}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {(field.itemFields ?? []).map((itemField) => (
                        <BlockFieldControl
                          key={itemField.key}
                          field={itemField}
                          value={asString(item[itemField.key])}
                          onChange={(value) =>
                            setItems(items.map((i) => (i.id === item.id ? { ...i, [itemField.key]: value } : i)))
                          }
                          htmlId={`block-field-${block.id}-${field.key}-${item.id}-${itemField.key}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="mt-2.5 w-full"
                leftIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={() => setItems([...items, createRepeaterItem(field.itemFields)])}
              >
                Add {field.itemLabel ?? 'item'}
              </Button>
            </div>
          )
        }

        return (
          <BlockFieldControl
            key={field.key}
            field={field}
            value={asString(data[field.key])}
            onChange={(value) => onChange({ ...data, [field.key]: value })}
            htmlId={`block-field-${block.id}-${field.key}`}
          />
        )
      })}
    </div>
  )
}

/** Lets a widget's content be saved once and placed on other pages by reference, edited from any of them. */
function ReusableWidgetPanel({
  label,
  sharedWidget,
  usageCount,
  onMakeReusable,
  onUnlink,
  onRename,
}: {
  label: string
  sharedWidget?: SharedWidget
  usageCount: number
  onMakeReusable: (name: string) => void
  onUnlink: () => void
  onRename: (name: string) => void
}) {
  const [draftName, setDraftName] = useState(label)
  const [renameValue, setRenameValue] = useState(sharedWidget?.name ?? '')

  // This panel doesn't remount when a block goes from unlinked to linked
  // (e.g. right after "Save"), so the rename field's local draft has to be
  // re-synced whenever the shared widget's actual name changes underneath it.
  useEffect(() => {
    setRenameValue(sharedWidget?.name ?? '')
  }, [sharedWidget?.name])

  if (sharedWidget) {
    return (
      <div className="space-y-2.5 rounded-lg border border-brand-200 bg-brand-50/50 p-3 dark:border-brand-500/30 dark:bg-brand-500/5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
          <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
          Reusable widget
        </div>
        <Field label="Name" htmlFor={`shared-name-${sharedWidget.id}`} hideLabel>
          <Input
            id={`shared-name-${sharedWidget.id}`}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => {
              const trimmed = renameValue.trim()
              if (trimmed && trimmed !== sharedWidget.name) onRename(trimmed)
              else setRenameValue(sharedWidget.name)
            }}
          />
        </Field>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Used on {usageCount} page{usageCount === 1 ? '' : 's'}. Editing this updates every page that uses it.
        </p>
        <Button size="sm" variant="secondary" className="w-full" onClick={onUnlink}>
          Unlink (make independent copy)
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-700">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Save this {label.toLowerCase()} so you can reuse the same content on other pages — editing it anywhere
        updates it everywhere.
      </p>
      <div className="flex gap-2">
        <Input
          aria-label="Reusable widget name"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder={`${label} name`}
          className="flex-1"
        />
        <Button size="sm" variant="secondary" onClick={() => draftName.trim() && onMakeReusable(draftName.trim())}>
          Save
        </Button>
      </div>
    </div>
  )
}

/** A single text/textarea/select/url/media control — used for both top-level and repeater-item fields. */
function BlockFieldControl({
  field,
  value,
  onChange,
  htmlId,
}: {
  field: BlockFieldDef
  value: string
  onChange: (value: string) => void
  htmlId: string
}) {
  const { getMedia } = useData()
  const [pickerOpen, setPickerOpen] = useState(false)

  if (field.input === 'media') {
    const media = getMedia(value)
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</p>
        {media ? (
          <div className="space-y-2">
            <MediaThumb item={media} className="aspect-video w-full" />
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => setPickerOpen(true)}>
                Change
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onChange('')}>
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-brand-400 hover:text-brand-500 dark:border-slate-700"
          >
            <ImageIcon className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-medium">Select image</span>
          </button>
        )}
        {field.helpText && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{field.helpText}</p>}
        <MediaPickerModal isOpen={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={onChange} />
      </div>
    )
  }

  if (field.input === 'boolean') {
    return (
      <div>
        <Switch id={htmlId} checked={value === 'true'} onChange={(checked) => onChange(checked ? 'true' : 'false')} label={field.label} />
        {field.helpText && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{field.helpText}</p>}
      </div>
    )
  }

  if (field.input === 'select') {
    return (
      <Field label={field.label} htmlFor={htmlId} helpText={field.helpText}>
        <Select id={htmlId} value={value} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </Field>
    )
  }

  if (field.input === 'textarea') {
    return (
      <Field label={field.label} htmlFor={htmlId} helpText={combinedHelp(field, value)}>
        <Textarea
          id={htmlId}
          rows={3}
          value={value}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
    )
  }

  return (
    <Field label={field.label} htmlFor={htmlId} helpText={combinedHelp(field, value)}>
      <Input
        id={htmlId}
        type={field.input === 'url' ? 'url' : 'text'}
        value={value}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}
