import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Monitor, Smartphone, Pencil, Info } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { Avatar } from '../../components/ui/Avatar'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { MediaThumb } from '../../components/ui/MediaThumb'
import { Button } from '../../components/ui/Button'
import { BlockPreview } from '../pageBuilder/BlockPreview'
import { cx, formatDate, readingTime } from '../../lib/utils'

type Viewport = 'desktop' | 'mobile'

/**
 * Renders a content item roughly as it would appear on the live site:
 * hero image, title, meta, and either the page-builder layout (if the
 * item has blocks) or the rich-text body. Lives outside the CMS chrome
 * so it reads like an actual page rather than another editor screen.
 */
export function ContentPreviewPage() {
  const { typeSlug, id } = useParams<{ typeSlug: string; id: string }>()
  const navigate = useNavigate()
  const { data, getContentTypeBySlug, getUser, getMedia } = useData()
  const [viewport, setViewport] = useState<Viewport>('desktop')

  const contentType = getContentTypeBySlug(typeSlug ?? '')
  const item = data.content.find((c) => c.id === id)

  if (!contentType) return <Navigate to="/" replace />
  if (!item) return <Navigate to={`/content/${contentType.slug}`} replace />

  const author = getUser(item.authorId)
  const featuredImage = getMedia(item.featuredImageId)
  const hasBlocks = (item.blocks?.length ?? 0) > 0
  const bodyText = item.body.replace(/<[^>]+>/g, '')

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <button
          type="button"
          onClick={() => navigate(`/content/${contentType.slug}/${item.id}`)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to editor
        </button>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">Previewing “{item.title || 'Untitled'}”</span>
        <StatusBadge status={item.status} />

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              aria-pressed={viewport === 'desktop'}
              aria-label="Preview desktop width"
              className={cx(
                'rounded-md p-1.5',
                viewport === 'desktop'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200',
              )}
            >
              <Monitor className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              aria-pressed={viewport === 'mobile'}
              aria-label="Preview mobile width"
              className={cx(
                'rounded-md p-1.5',
                viewport === 'mobile'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200',
              )}
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <Button size="sm" variant="secondary" leftIcon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />} onClick={() => navigate(`/content/${contentType.slug}/${item.id}`)}>
            Edit
          </Button>
        </div>
      </header>

      {item.status !== 'published' && (
        <div className="flex items-center justify-center gap-2 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          This is a preview — {item.title || 'this item'} is {item.status.replace('-', ' ')} and not visible on the live site yet.
        </div>
      )}

      <div className="px-4 py-10">
        <div
          className={cx(
            'mx-auto rounded-2xl bg-white shadow-xl transition-all dark:bg-slate-900',
            viewport === 'mobile' ? 'max-w-sm' : 'max-w-3xl',
          )}
        >
          <article className="overflow-hidden rounded-2xl">
            {featuredImage && <MediaThumb item={featuredImage} className="aspect-[16/9] w-full rounded-none" />}

            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                <Badge color="brand">{contentType.name}</Badge>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {item.title || 'Untitled'}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                {author && (
                  <span className="flex items-center gap-2">
                    <Avatar name={author.name} gradient={author.avatarColor} size="xs" />
                    {author.name}
                  </span>
                )}
                <span aria-hidden="true">·</span>
                <span>{formatDate(item.publishedAt ?? item.updatedAt)}</span>
                {bodyText && !hasBlocks && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{readingTime(bodyText)}</span>
                  </>
                )}
              </div>

              {item.excerpt && (
                <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{item.excerpt}</p>
              )}

              {!hasBlocks && (
                <div
                  className="prose-content mt-6 text-[15px] leading-relaxed text-slate-700 [&_a]:text-brand-600 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 dark:text-slate-300"
                  // Body HTML is authored locally in this prototype's own rich-text editor
                  // (contentEditable + execCommand), never fetched from an external source.
                  dangerouslySetInnerHTML={{ __html: item.body || '<p class="text-slate-400">Nothing written yet.</p>' }}
                />
              )}

              {item.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-1.5 border-t border-slate-100 pt-6 dark:border-slate-800">
                  {item.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            {hasBlocks && (
              <div className="border-t border-slate-100 dark:border-slate-800">
                {item.blocks!.map((block) => (
                  <BlockPreview key={block.id} block={block} />
                ))}
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  )
}
