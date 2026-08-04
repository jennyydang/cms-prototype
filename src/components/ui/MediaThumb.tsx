import { FileText, Film, Image as ImageIcon } from 'lucide-react'
import type { MediaItem } from '../../lib/types'
import { cx } from '../../lib/utils'

const kindIcon = { image: ImageIcon, document: FileText, video: Film }

/**
 * Stand-in for a real image thumbnail: a deterministic gradient plus a
 * kind icon, so the media library reads clearly without any network
 * image loading or binary assets in the prototype.
 */
export function MediaThumb({ item, className }: { item: MediaItem; className?: string }) {
  const Icon = kindIcon[item.kind]

  if (item.dataUrl) {
    return (
      <div className={cx('overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800', className)}>
        <img src={item.dataUrl} alt={item.alt} className="h-full w-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={cx('relative flex items-center justify-center overflow-hidden rounded-lg', className)}
      style={{ background: `linear-gradient(135deg, ${item.colorFrom}, ${item.colorTo})` }}
    >
      <Icon className="h-1/3 w-1/3 text-white/90" aria-hidden="true" strokeWidth={1.5} />
    </div>
  )
}
