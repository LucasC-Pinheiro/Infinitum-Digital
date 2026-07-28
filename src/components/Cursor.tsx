import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

/**
 * Custom cursor (dot + trailing ring) plus the ambient spotlight that
 * follows the pointer. Only activates for fine pointers without
 * prefers-reduced-motion — on touch devices / reduced motion it renders
 * inert elements that CSS hides or leaves fully transparent.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (!isFinePointer || reduceMotion) return

    const dot = dotRef.current
    const ring = ringRef.current
    const spotlight = spotlightRef.current
    if (!dot || !ring || !spotlight) return

    document.documentElement.classList.add('custom-cursor')

    const setDotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' })
    const setDotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' })
    const setRingX = gsap.quickTo(ring, 'x', { duration: 0.32, ease: 'power3.out' })
    const setRingY = gsap.quickTo(ring, 'y', { duration: 0.32, ease: 'power3.out' })

    function handleMouseMove(e: MouseEvent) {
      setDotX(e.clientX)
      setDotY(e.clientY)
      setRingX(e.clientX)
      setRingY(e.clientY)
      spotlight!.style.setProperty('--sx', `${e.clientX}px`)
      spotlight!.style.setProperty('--sy', `${e.clientY}px`)
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.documentElement.classList.remove('custom-cursor')
    }
  }, [])

  return (
    <>
      <div ref={spotlightRef} className="spotlight" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}
