import { useData } from '../../context/DataContext'
import { Modal } from './Modal'
import { MediaThumb } from './MediaThumb'
import { EmptyState } from './EmptyState'
import { Image as ImageIcon } from 'lucide-react'

/** Shared image picker used by the featured-image field and block inspector. */
export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Select an image',
}: {
  isOpen: boolean
  onClose: () => void
  onSelect: (mediaId: string) => void
  title?: string
}) {
  const { data } = useData()
  const images = data.media.filter((m) => m.kind === 'image')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      {images.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-6 w-6" aria-hidden="true" />}
          title="No images yet"
          description="Upload an image in the Media Library first."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onSelect(m.id)
                onClose()
              }}
              className="group text-left focus-visible:outline-none"
            >
              <MediaThumb item={m} className="aspect-square w-full ring-2 ring-transparent group-focus-visible:ring-brand-500" />
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{m.filename}</p>
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}
