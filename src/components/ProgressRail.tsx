import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'

export interface ProgressRailHandle {
  setProgress: (progress: number) => void
}

export interface ProgressRailProps {
  ref?: Ref<ProgressRailHandle>
}

/**
 * Fixed side rail showing scroll progress (0-1). Exposes an imperative
 * `setProgress` so callers can update it every scroll tick without paying
 * for a React re-render. Hidden below 900px, but still mirrors whole-page
 * scroll progress on mobile to match the original prototype's behavior.
 */
export function ProgressRail({ ref }: ProgressRailProps) {
  const fillRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(
    ref,
    () => ({
      setProgress(progress: number) {
        if (fillRef.current) {
          fillRef.current.style.height = `${progress * 100}%`
        }
      },
    }),
    [],
  )

  useEffect(() => {
    function handleScroll() {
      if (window.innerWidth < 900) {
        const doc = document.documentElement
        const progress = doc.scrollTop / (doc.scrollHeight - window.innerHeight)
        if (fillRef.current) {
          fillRef.current.style.height = `${progress * 100}%`
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="progress-rail">
      <div ref={fillRef} className="progress-fill" />
    </div>
  )
}
