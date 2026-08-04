import { ArrowRight, Image as ImageIcon, Quote as QuoteIcon } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { MediaThumb } from '../../components/ui/MediaThumb'
import { cx } from '../../lib/utils'
import type { PageBlock } from '../../lib/types'

const spacerHeights: Record<string, string> = { sm: 'h-6', md: 'h-12', lg: 'h-20' }

/** Renders a live-ish, read-only preview of a block's current data for the builder canvas. */
export function BlockPreview({ block }: { block: PageBlock }) {
  const { getMedia } = useData()
  const d = block.data

  switch (block.type) {
    case 'hero':
      return (
        <div className={cx('px-8 py-14', d.align === 'left' ? 'text-left' : 'text-center')}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{d.heading || 'Heading'}</h2>
          {d.subheading && (
            <p className={cx('mt-3 text-slate-500 dark:text-slate-400', d.align === 'left' ? '' : 'mx-auto max-w-xl')}>{d.subheading}</p>
          )}
          {d.ctaLabel && (
            <span className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
              {d.ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
        </div>
      )

    case 'text':
      return (
        <div className="px-8 py-8">
          {d.heading && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{d.heading}</h3>}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">{d.body || 'Write something…'}</p>
        </div>
      )

    case 'image': {
      const media = getMedia(d.mediaId)
      return (
        <div className="px-8 py-8">
          {media ? (
            <MediaThumb item={media} className="aspect-video w-full" />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
              <ImageIcon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs">No image selected</span>
            </div>
          )}
          {d.caption && <p className="mt-2 text-center text-xs italic text-slate-400">{d.caption}</p>}
        </div>
      )
    }

    case 'columns':
      return (
        <div className="grid grid-cols-1 gap-6 px-8 py-8 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{d.leftHeading || 'Left heading'}</h4>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{d.leftBody}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{d.rightHeading || 'Right heading'}</h4>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{d.rightBody}</p>
          </div>
        </div>
      )

    case 'quote':
      return (
        <div className="px-8 py-10">
          <blockquote className="border-l-2 border-brand-500 pl-4">
            <QuoteIcon className="h-4 w-4 text-brand-400" aria-hidden="true" />
            <p className="mt-1.5 text-lg italic text-slate-800 dark:text-slate-100">{d.quote || 'Quote text'}</p>
            {d.attribution && <footer className="mt-2 text-sm text-slate-500 dark:text-slate-400">— {d.attribution}</footer>}
          </blockquote>
        </div>
      )

    case 'cta':
      return (
        <div className="mx-8 my-8 rounded-xl bg-slate-900 px-8 py-10 text-center dark:bg-slate-800">
          <h3 className="text-xl font-semibold text-white">{d.heading || 'Heading'}</h3>
          {d.body && <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">{d.body}</p>}
          {d.buttonLabel && (
            <span className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900">{d.buttonLabel}</span>
          )}
        </div>
      )

    case 'spacer':
      return (
        <div className="px-8 py-2">
          <div className={cx('flex items-center justify-center rounded border border-dashed border-slate-200 text-[11px] text-slate-300 dark:border-slate-700 dark:text-slate-600', spacerHeights[d.size] ?? spacerHeights.md)}>
            Spacer · {d.size ?? 'md'}
          </div>
        </div>
      )

    default:
      return null
  }
}
