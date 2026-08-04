import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Gauge,
  Globe,
  Heart,
  Image as ImageIcon,
  Info,
  Lock,
  Quote as QuoteIcon,
  Rocket,
  Shield,
  Sparkles,
  Star,
  X,
  XCircle,
  Zap,
  type LucideIcon,
} from 'lucide-react'
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

const blurbIcons: Record<string, LucideIcon> = { Sparkles, Shield, Zap, Heart, Rocket, Star, Lock, Gauge }

const notificationVariants: Record<string, { icon: LucideIcon; classes: string; label: string }> = {
  info: { icon: Info, classes: 'bg-brand-50 text-brand-800 dark:bg-brand-500/10 dark:text-brand-300', label: 'Info' },
  success: { icon: CheckCircle2, classes: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300', label: 'Success' },
  warning: { icon: AlertTriangle, classes: 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300', label: 'Warning' },
  error: { icon: XCircle, classes: 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300', label: 'Error' },
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function items(value: unknown): RepeaterItem[] {
  return Array.isArray(value) ? value : []
}

/** Renders a live-ish, read-only preview of a block's current data for the builder canvas. */
export function BlockPreview({ block }: { block: PageBlock }) {
  const { getMedia, getSharedWidget } = useData()
  const [dismissed, setDismissed] = useState(false)
  // A linked block's real content lives on the shared widget, not its own
  // (empty) `data` — resolving it here means the canvas, live Preview, and
  // every other page placing the same widget always render the current
  // shared content, with the block's own data only as a defensive fallback.
  const d = block.sharedWidgetId ? (getSharedWidget(block.sharedWidgetId)?.data ?? block.data) : block.data

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

    case 'testimonials': {
      const testimonials = items(d.testimonials)
      return (
        <div className="px-8 py-10">
          {str(d.heading) && <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{str(d.heading)}</h3>}
          {testimonials.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No testimonials added yet.</p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {testimonials.map((testimonial) => {
                const avatar = getMedia(str(testimonial.avatar))
                return (
                  <figure key={testimonial.id} className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                    <QuoteIcon className="h-4 w-4 text-brand-400" aria-hidden="true" />
                    <blockquote className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                      {str(testimonial.quote) || 'Quote text'}
                    </blockquote>
                    <figcaption className="mt-4 flex items-center gap-2.5">
                      {avatar ? (
                        <MediaThumb item={avatar} className="h-9 w-9 shrink-0 rounded-full" />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                          <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      )}
                      <span>
                        <span className="block text-sm font-medium text-slate-900 dark:text-white">{str(testimonial.name) || 'Customer name'}</span>
                        {str(testimonial.role) && <span className="block text-xs text-slate-500 dark:text-slate-400">{str(testimonial.role)}</span>}
                      </span>
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    case 'faq': {
      const faqs = items(d.items)
      return (
        <div className="px-8 py-10">
          {str(d.heading) && <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{str(d.heading)}</h3>}
          <div className="mt-4 divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {faqs.length === 0 ? (
              <p className="py-3 text-sm text-slate-400">No questions added yet.</p>
            ) : (
              faqs.map((faq) => (
                <details key={faq.id} className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-slate-900 marker:content-none dark:text-white">
                    {str(faq.question) || 'Question'}
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{str(faq.answer)}</p>
                </details>
              ))
            )}
          </div>
        </div>
      )
    }

    case 'blurb': {
      const blurbs = items(d.blurbs)
      return (
        <div className="px-8 py-10">
          {str(d.heading) && <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{str(d.heading)}</h3>}
          {blurbs.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No blurbs added yet.</p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {blurbs.map((blurb) => {
                const Icon = blurbIcons[str(blurb.icon)] ?? Sparkles
                return (
                  <div key={blurb.id}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <h4 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{str(blurb.title) || 'Feature title'}</h4>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{str(blurb.body)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    case 'notification': {
      if (dismissed) return null
      const variant = notificationVariants[str(d.variant)] ?? notificationVariants.info
      const Icon = variant.icon
      const dismissible = str(d.dismissible) !== 'false'
      return (
        <div className={cx('flex items-center gap-3 px-8 py-3', variant.classes)}>
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="min-w-0 flex-1 truncate text-sm">
            <span className="sr-only">{variant.label}: </span>
            {str(d.message) || 'Notification message'}
            {str(d.linkLabel) && <span className="ml-2 font-medium underline">{str(d.linkLabel)}</span>}
          </p>
          {dismissible && (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )
    }

    case 'product-details': {
      const media = getMedia(str(d.image))
      const features = items(d.features)
      return (
        <div className="grid grid-cols-1 gap-6 px-8 py-10 sm:grid-cols-2">
          {media ? (
            <MediaThumb item={media} className="aspect-square w-full" />
          ) : (
            <div className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
              <ImageIcon className="h-6 w-6" aria-hidden="true" />
              <span className="text-xs">No image selected</span>
            </div>
          )}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{str(d.name) || 'Product name'}</h3>
              <span className="shrink-0 text-lg font-medium text-brand-600 dark:text-brand-400">{str(d.price)}</span>
            </div>
            {str(d.description) && <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{str(d.description)}</p>}
            {features.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {features.map((feature) => (
                  <li key={feature.id} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                    {str(feature.label)}
                  </li>
                ))}
              </ul>
            )}
            {str(d.buttonLabel) && (
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
                {str(d.buttonLabel)}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
          </div>
        </div>
      )
    }

    default:
      return null
  }
}
