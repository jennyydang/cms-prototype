import { useState } from 'react'
import { ChevronDown, ChevronUp, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { MediaThumb } from '../../components/ui/MediaThumb'
import { MediaPickerModal } from '../../components/ui/MediaPickerModal'
import { createRepeaterItem, getBlockTypeDef } from '../../lib/blocks'
import type { BlockFieldDef, BlockFieldValue, PageBlock, RepeaterItem } from '../../lib/types'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asItems(value: unknown): RepeaterItem[] {
  return Array.isArray(value) ? value : []
}

/** Generic edit form for a block, rendered from its BlockTypeDef field list. */
export function BlockInspector({
  block,
  onChange,
}: {
  block: PageBlock
  onChange: (data: Record<string, BlockFieldValue>) => void
}) {
  const def = getBlockTypeDef(block.type)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{def.label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{def.description}</p>
      </div>

      {def.fields.map((field) => {
        if (field.input === 'repeater') {
          const items = asItems(block.data[field.key])

          function setItems(next: RepeaterItem[]) {
            onChange({ ...block.data, [field.key]: next })
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
            value={asString(block.data[field.key])}
            onChange={(value) => onChange({ ...block.data, [field.key]: value })}
            htmlId={`block-field-${block.id}-${field.key}`}
          />
        )
      })}
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
        <MediaPickerModal isOpen={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={onChange} />
      </div>
    )
  }

  if (field.input === 'select') {
    return (
      <Field label={field.label} htmlFor={htmlId}>
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
      <Field label={field.label} htmlFor={htmlId}>
        <Textarea id={htmlId} rows={3} value={value} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
      </Field>
    )
  }

  return (
    <Field label={field.label} htmlFor={htmlId}>
      <Input
        id={htmlId}
        type={field.input === 'url' ? 'url' : 'text'}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}
