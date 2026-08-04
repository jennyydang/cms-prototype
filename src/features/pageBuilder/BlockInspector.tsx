import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { MediaThumb } from '../../components/ui/MediaThumb'
import { MediaPickerModal } from '../../components/ui/MediaPickerModal'
import { getBlockTypeDef } from '../../lib/blocks'
import type { PageBlock } from '../../lib/types'

/** Generic edit form for a block, rendered from its BlockTypeDef field list. */
export function BlockInspector({
  block,
  onChange,
}: {
  block: PageBlock
  onChange: (data: Record<string, string>) => void
}) {
  const def = getBlockTypeDef(block.type)
  const { getMedia } = useData()
  const [pickerOpen, setPickerOpen] = useState(false)

  function setField(key: string, value: string) {
    onChange({ ...block.data, [key]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{def.label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{def.description}</p>
      </div>

      {def.fields.map((f) => {
        const htmlId = `block-field-${block.id}-${f.key}`
        const value = block.data[f.key] ?? ''

        if (f.input === 'media') {
          const media = getMedia(value)
          return (
            <div key={f.key}>
              <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">{f.label}</p>
              {media ? (
                <div className="space-y-2">
                  <MediaThumb item={media} className="aspect-video w-full" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => setPickerOpen(true)}>
                      Change
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setField(f.key, '')}>
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
              <MediaPickerModal isOpen={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(id) => setField(f.key, id)} />
            </div>
          )
        }

        if (f.input === 'select') {
          return (
            <Field key={f.key} label={f.label} htmlFor={htmlId}>
              <Select id={htmlId} value={value} onChange={(e) => setField(f.key, e.target.value)}>
                {f.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </Field>
          )
        }

        if (f.input === 'textarea') {
          return (
            <Field key={f.key} label={f.label} htmlFor={htmlId}>
              <Textarea id={htmlId} rows={3} value={value} placeholder={f.placeholder} onChange={(e) => setField(f.key, e.target.value)} />
            </Field>
          )
        }

        return (
          <Field key={f.key} label={f.label} htmlFor={htmlId}>
            <Input
              id={htmlId}
              type={f.input === 'url' ? 'url' : 'text'}
              value={value}
              placeholder={f.placeholder}
              onChange={(e) => setField(f.key, e.target.value)}
            />
          </Field>
        )
      })}
    </div>
  )
}
