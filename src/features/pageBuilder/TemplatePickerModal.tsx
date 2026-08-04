import { ArrowRight } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { getBlockTypeDef } from '../../lib/blocks'
import { blockIcons, defaultBlockIcon } from '../../lib/blockIcons'
import { pageTemplates, type PageTemplateDef } from '../../lib/pageTemplates'

/** Lets a content manager start a page's layout from a consistent, named recipe of blocks instead of a blank canvas. */
export function TemplatePickerModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean
  onClose: () => void
  onSelect: (template: PageTemplateDef) => void
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start from a template"
      description="Pick a starting layout for consistent structure — every block can still be edited, reordered, or removed afterward."
      size="lg"
    >
      <div className="space-y-3">
        {pageTemplates.map((template) => {
          const Icon = blockIcons[template.icon] ?? defaultBlockIcon
          return (
            <div key={template.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{template.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{template.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2">
                    {template.blockTypes.map((type, index) => {
                      const def = getBlockTypeDef(type)
                      const BlockIcon = blockIcons[def.icon] ?? defaultBlockIcon
                      return (
                        <span key={`${type}-${index}`} className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <BlockIcon className="h-3 w-3" aria-hidden="true" />
                            {def.label}
                          </span>
                          {index < template.blockTypes.length - 1 && (
                            <ArrowRight className="h-3 w-3 shrink-0 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                          )}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => onSelect(template)}>
                Use this template
              </Button>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
