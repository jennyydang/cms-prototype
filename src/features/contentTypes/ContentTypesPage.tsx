import { useState, type FormEvent } from 'react'
import {
  FileText,
  File,
  Package,
  Boxes,
  Plus,
  Trash2,
  Type,
  Hash,
  ToggleLeft,
  Calendar,
  Image as ImageIcon,
  List as ListIcon,
  Link2,
  AlignLeft,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Field } from '../../components/ui/Field'
import { Checkbox } from '../../components/ui/Checkbox'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { cx, slugify } from '../../lib/utils'
import type { FieldType } from '../../lib/types'

const typeIconMap: Record<string, typeof FileText> = { FileText, File, Package }

const fieldTypeMeta: Record<FieldType, { label: string; icon: typeof Type }> = {
  text: { label: 'Text', icon: Type },
  richtext: { label: 'Rich text', icon: AlignLeft },
  number: { label: 'Number', icon: Hash },
  boolean: { label: 'Boolean', icon: ToggleLeft },
  date: { label: 'Date', icon: Calendar },
  media: { label: 'Media', icon: ImageIcon },
  select: { label: 'Select', icon: ListIcon },
  reference: { label: 'Reference', icon: Link2 },
}

export function ContentTypesPage() {
  const { data, createContentType, addField, removeField, updateField } = useData()
  const { showToast } = useToast()

  const [selectedId, setSelectedId] = useState(data.contentTypes[0]?.id)
  const [newTypeOpen, setNewTypeOpen] = useState(false)
  const [newFieldOpen, setNewFieldOpen] = useState(false)
  const [confirmRemoveField, setConfirmRemoveField] = useState<string | null>(null)

  const selected = data.contentTypes.find((t) => t.id === selectedId) ?? data.contentTypes[0]

  const [typeName, setTypeName] = useState('')
  const [typeDescription, setTypeDescription] = useState('')

  const [fieldLabel, setFieldLabel] = useState('')
  const [fieldType, setFieldType] = useState<FieldType>('text')
  const [fieldRequired, setFieldRequired] = useState(false)

  function handleCreateType(e: FormEvent) {
    e.preventDefault()
    if (!typeName.trim()) return
    const created = createContentType({
      name: typeName,
      pluralName: `${typeName}s`,
      slug: slugify(`${typeName}s`),
      description: typeDescription || `${typeName} content.`,
      icon: 'FileText',
    })
    setSelectedId(created.id)
    setNewTypeOpen(false)
    setTypeName('')
    setTypeDescription('')
    showToast({ title: 'Content type created', description: `"${created.name}" is ready with default fields.`, variant: 'success' })
  }

  function handleAddField(e: FormEvent) {
    e.preventDefault()
    if (!selected || !fieldLabel.trim()) return
    addField(selected.id, {
      key: slugify(fieldLabel).replace(/-/g, '_'),
      label: fieldLabel,
      type: fieldType,
      required: fieldRequired,
    })
    setNewFieldOpen(false)
    setFieldLabel('')
    setFieldType('text')
    setFieldRequired(false)
    showToast({ title: 'Field added', variant: 'success' })
  }

  const contentCount = (typeId: string) => data.content.filter((c) => c.contentTypeId === typeId).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Content Types</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            This is the schema that powers every editor screen. Each content type defines the fields authors fill
            in — add a field here and it becomes available across that type&rsquo;s content immediately.
          </p>
        </div>
        <Button onClick={() => setNewTypeOpen(true)} leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>
          New content type
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {data.contentTypes.map((type) => {
            const Icon = typeIconMap[type.icon] ?? Boxes
            const active = type.id === selected?.id
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedId(type.id)}
                aria-current={active}
                className={cx(
                  'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors',
                  active
                    ? 'border-brand-300 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
                )}
              >
                <div className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', active ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400')}>
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{type.pluralName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {type.fields.length} fields · {contentCount(type.id)} items
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {selected && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{selected.name}</h2>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{selected.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Badge>/{selected.slug}</Badge>
                  <span>{contentCount(selected.id)} items</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Fields</h3>
                <Button size="sm" variant="secondary" leftIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />} onClick={() => setNewFieldOpen(true)}>
                  Add field
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                      <th scope="col" className="px-5 py-2.5 font-medium">Label</th>
                      <th scope="col" className="px-2 py-2.5 font-medium">Key</th>
                      <th scope="col" className="px-2 py-2.5 font-medium">Type</th>
                      <th scope="col" className="px-2 py-2.5 font-medium">Required</th>
                      <th scope="col" className="w-10 px-5 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selected.fields.map((field) => {
                      const meta = fieldTypeMeta[field.type]
                      const Icon = meta.icon
                      return (
                        <tr key={field.id}>
                          <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{field.label}</td>
                          <td className="px-2 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{field.key}</td>
                          <td className="px-2 py-3">
                            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-2 py-3">
                            <Checkbox
                              aria-label={`Required: ${field.label}`}
                              checked={field.required}
                              onChange={(e) => updateField(selected.id, field.id, { required: e.target.checked })}
                            />
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setConfirmRemoveField(field.id)}
                              aria-label={`Remove field ${field.label}`}
                              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={newTypeOpen}
        onClose={() => setNewTypeOpen(false)}
        title="New content type"
        description="Define a new kind of content, like Case Study or Event."
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewTypeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="new-type-form">
              Create content type
            </Button>
          </>
        }
      >
        <form id="new-type-form" onSubmit={handleCreateType} className="space-y-4">
          <Field label="Name" htmlFor="type-name" required helpText="Singular form, e.g. Case Study">
            <Input id="type-name" value={typeName} onChange={(e) => setTypeName(e.target.value)} required autoFocus />
          </Field>
          <Field label="Description" htmlFor="type-desc">
            <Textarea id="type-desc" rows={2} value={typeDescription} onChange={(e) => setTypeDescription(e.target.value)} />
          </Field>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            New content types start with Title, Slug, and Body fields — add more once it&rsquo;s created.
          </p>
        </form>
      </Modal>

      <Modal
        isOpen={newFieldOpen}
        onClose={() => setNewFieldOpen(false)}
        title={`Add a field to ${selected?.name ?? ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewFieldOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="new-field-form">
              Add field
            </Button>
          </>
        }
      >
        <form id="new-field-form" onSubmit={handleAddField} className="space-y-4">
          <Field label="Field label" htmlFor="field-label" required helpText="Shown to editors, e.g. Subtitle">
            <Input id="field-label" value={fieldLabel} onChange={(e) => setFieldLabel(e.target.value)} required autoFocus />
          </Field>
          <Field label="Field type" htmlFor="field-type">
            <Select id="field-type" value={fieldType} onChange={(e) => setFieldType(e.target.value as FieldType)}>
              {Object.entries(fieldTypeMeta).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </Select>
          </Field>
          <Checkbox
            id="field-required"
            label="Required field"
            checked={fieldRequired}
            onChange={(e) => setFieldRequired(e.target.checked)}
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmRemoveField !== null}
        onClose={() => setConfirmRemoveField(null)}
        onConfirm={() => {
          if (selected && confirmRemoveField) removeField(selected.id, confirmRemoveField)
          setConfirmRemoveField(null)
          showToast({ title: 'Field removed', variant: 'info' })
        }}
        title="Remove this field?"
        description="Existing content keeps its data, but this field will no longer appear in the editor."
        confirmLabel="Remove"
        destructive
      />
    </div>
  )
}
