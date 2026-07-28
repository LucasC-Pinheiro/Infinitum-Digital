import { useRef, type Ref } from 'react'
import { useBlobField, type ClusterCenter } from './useBlobField'

export interface BlobFieldProps {
  clusterCenters: ClusterCenter[]
  /** Mutable 0-1 progress; see useBlobField for details. */
  morphRef: React.RefObject<number>
  blobCount?: number
  /** Points at the field container itself, e.g. for GSAP entrance tweens. */
  ref?: Ref<HTMLDivElement>
}

/**
 * Renders the blurred field of liquid blobs. `ref` points at the field
 * container itself, so callers (e.g. Act1Hero's entrance timeline) can
 * animate it directly with GSAP.
 */
export function BlobField({
  clusterCenters,
  morphRef,
  blobCount = 16,
  ref,
}: BlobFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const blobRefs = useRef<(HTMLDivElement | null)[]>([])

  useBlobField({
    containerRef,
    blobRefs,
    clusterCenters,
    morphRef,
    blobCount,
  })

  return (
    <div
      ref={(el) => {
        containerRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      }}
      className="field-wrapper"
    >
      {Array.from({ length: blobCount }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            blobRefs.current[i] = el
          }}
          className="blob"
        />
      ))}
    </div>
  )
}
