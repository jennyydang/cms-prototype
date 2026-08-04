import { ArrowRight, Globe, Image as ImageIcon, Quote as QuoteIcon } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { MediaThumb } from '../../components/ui/MediaThumb'
import { cx } from '../../lib/utils'
import type { PageBlock, RepeaterItem } from '../../lib/types'

const spacerHeights: Record<string, string> = { sm: 'h-6', md: 'h-12', lg: 'h-20' }

const platformLabels: Record<string, string> = {
  twitter: 'X (Twitter)',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  instagram: 'Instagram',
  youtube: 'YouTube',
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function items(value: unknown): RepeaterItem[] {
  return Array.isArray(value) ? value : []
}

/** Renders a live-ish, read-only preview of a block's current data for the builder canvas. */
export function BlockPreview({ block }: { block: PageBlock }) {
  const { getMedia } = useData()
  const d = block.data

  switch (block.type) {
    case 'hero': {
      const align = str(d.align)
      return (
        <div className={cx('px-8 py-14', align === 'left' ? 'text-left' : 'text-center')}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{str(d.heading) || 'Heading'}</h2>
          {str(d.subheading) && (
            <p className={cx('mt-3 text-slate-500 dark:text-slate-400', align === 'left' ? '' : 'mx-auto max-w-xl')}>{str(d.subheading)}</p>
          )}
          {str(d.ctaLabel) && (
            <span className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
              {str(d.ctaLabel)}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
        </div>
      )
    }

    case 'text':
      return (
        <div className="px-8 py-8">
          {str(d.heading) && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{str(d.heading)}</h3>}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">{str(d.body) || 'Write something…'}</p>
        </div>
      )

    case 'image': {
      const media = getMedia(str(d.mediaId))
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
          {str(d.caption) && <p className="mt-2 text-center text-xs italic text-slate-400">{str(d.caption)}</p>}
        </div>
      )
    }

    case 'columns':
      return (
        <div className="grid grid-cols-1 gap-6 px-8 py-8 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{str(d.leftHeading) || 'Left heading'}</h4>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{str(d.leftBody)}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{str(d.rightHeading) || 'Right heading'}</h4>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{str(d.rightBody)}</p>
          </div>
        </div>
      )

    case 'quote':
      return (
        <div className="px-8 py-10">
          <blockquote className="border-l-2 border-brand-500 pl-4">
            <QuoteIcon className="h-4 w-4 text-brand-400" aria-hidden="true" />
            <p className="mt-1.5 text-lg italic text-slate-800 dark:text-slate-100">{str(d.quote) || 'Quote text'}</p>
            {str(d.attribution) && <footer className="mt-2 text-sm text-slate-500 dark:text-slate-400">— {str(d.attribution)}</footer>}
          </blockquote>
        </div>
      )

    case 'cta':
      return (
        <div className="mx-8 my-8 rounded-xl bg-slate-900 px-8 py-10 text-center dark:bg-slate-800">
          <h3 className="text-xl font-semibold text-white">{str(d.heading) || 'Heading'}</h3>
          {str(d.body) && <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">{str(d.body)}</p>}
          {str(d.buttonLabel) && (
            <span className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900">{str(d.buttonLabel)}</span>
          )}
        </div>
      )

    case 'spacer': {
      const size = str(d.size) || 'md'
      return (
        <div className="px-8 py-2">
          <div className={cx('flex items-center justify-center rounded border border-dashed border-slate-200 text-[11px] text-slate-300 dark:border-slate-700 dark:text-slate-600', spacerHeights[size] ?? spacerHeights.md)}>
            Spacer · {size}
          </div>
        </div>
      )
    }

    case 'footer': {
      const links = items(d.links)
      const socialLinks = items(d.socialLinks)
      return (
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-10 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Atlas</p>
              {str(d.tagline) && <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">{str(d.tagline)}</p>}
            </div>
            {links.length > 0 && (
              <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
                {links.map((link) => (
                  <span key={link.id} className="text-sm text-slate-600 dark:text-slate-300">
                    {str(link.label) || 'Link'}
                  </span>
                ))}
              </nav>
            )}
          </div>
          {socialLinks.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <span
                  key={link.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400"
                >
                  <Globe className="h-3 w-3" aria-hidden="true" />
                  {platformLabels[str(link.platform)] ?? str(link.platform) ?? 'Link'}
                </span>
              ))}
            </div>
          )}
          {str(d.copyright) && (
            <p className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-400 dark:border-slate-800">{str(d.copyright)}</p>
          )}
        </div>
      )
    }

    case 'product-gallery': {
      const products = items(d.products)
      return (
        <div className="px-8 py-10">
          {str(d.heading) && <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{str(d.heading)}</h3>}
          {products.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No products added yet.</p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {products.map((product) => {
                const media = getMedia(str(product.image))
                return (
                  <div key={product.id} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    {media ? (
                      <MediaThumb item={media} className="aspect-video w-full" />
                    ) : (
                      <div className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 border-b border-slate-200 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600">
                        <ImageIcon className="h-5 w-5" aria-hidden="true" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{str(product.name) || 'Product name'}</h4>
                        <span className="shrink-0 text-sm font-medium text-brand-600 dark:text-brand-400">{str(product.price)}</span>
                      </div>
                      {str(product.description) && (
                        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{str(product.description)}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    default:
      return null
  }
}
