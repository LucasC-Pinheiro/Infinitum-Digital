import { useEffect, type RefObject } from 'react'

export interface ClusterCenter {
  x: number
  y: number
}

interface BlobParticle {
  phase: number
  cluster: number
  size: number
  localPhase: number
}

// Mirrors --color-violet / --color-cyan in src/index.css. Kept as plain hex
// here because the RGB channels are interpolated per-frame in JS.
const VIOLET_HEX = '#6D5EF5'
const CYAN_HEX = '#22D3C5'

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function mixHex(hexA: string, hexB: string, t: number): string {
  const a = parseInt(hexA.slice(1), 16)
  const b = parseInt(hexB.slice(1), 16)
  const ar = (a >> 16) & 255
  const ag = (a >> 8) & 255
  const ab = a & 255
  const br = (b >> 16) & 255
  const bg = (b >> 8) & 255
  const bb = b & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `rgb(${r},${g},${bl})`
}

export interface UseBlobFieldOptions {
  /** The blurred field container the blobs are positioned relative to. */
  containerRef: RefObject<HTMLDivElement | null>
  /** One ref per blob div, in render order. */
  blobRefs: RefObject<(HTMLDivElement | null)[]>
  /** Cluster targets the blobs converge to as `morphRef` goes from 0 to 1. */
  clusterCenters: ClusterCenter[]
  /**
   * Mutable 0-1 progress read every animation frame. Driven externally
   * (e.g. from a ScrollTrigger onUpdate) without triggering React renders.
   */
  morphRef: RefObject<number>
  blobCount?: number
}

/**
 * Owns the blob field's physics: idle infinity-loop motion, morphing toward
 * cluster centers, and mouse repulsion. Renders nothing itself — it mutates
 * the DOM nodes passed in via blobRefs directly for performance, since this
 * runs every animation frame.
 */
export function useBlobField({
  containerRef,
  blobRefs,
  clusterCenters,
  morphRef,
  blobCount = 16,
}: UseBlobFieldOptions): void {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const particles: BlobParticle[] = Array.from(
      { length: blobCount },
      (_, i) => ({
        phase: (i / blobCount) * Math.PI * 2,
        cluster: i % clusterCenters.length,
        size: 44 + Math.random() * 30,
        localPhase: Math.random() * Math.PI * 2,
      }),
    )

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const mouse = { x: 99999, y: 99999 }

    function handleMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect()
      mouse.x = e.clientX - rect.left - rect.width / 2
      mouse.y = e.clientY - rect.top - rect.height / 2
    }

    function handleMouseLeave() {
      mouse.x = 99999
      mouse.y = 99999
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    let time = 0
    let rafId: number

    function render() {
      time += reduceMotion ? 0 : 0.012
      const fw = container!.clientWidth
      const fh = container!.clientHeight
      const rx = fw * 0.42
      const ry = fh * 0.3
      const morph = morphRef.current ?? 0
      const els = blobRefs.current

      for (let i = 0; i < particles.length; i++) {
        const el = els[i]
        if (!el) continue
        const particle = particles[i]

        const tt = particle.phase + time * 0.6
        const loopX = Math.cos(tt) * rx
        const loopY = Math.sin(tt) * Math.cos(tt) * ry * 1.7

        const center = clusterCenters[particle.cluster]
        const clusterX =
          (center.x - 0.5) * fw + Math.cos(particle.localPhase + time * 1.3) * 16
        const clusterY =
          (center.y - 0.5) * fh + Math.sin(particle.localPhase + time * 1.3) * 16

        let x = loopX + (clusterX - loopX) * morph
        let y = loopY + (clusterY - loopY) * morph

        const dx = x - mouse.x
        const dy = y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const repelRadius = 120
        if (dist < repelRadius && dist > 0.01) {
          const force = (repelRadius - dist) / repelRadius
          x += (dx / dist) * force * 36
          y += (dy / dist) * force * 36
        }

        el.style.width = `${particle.size}px`
        el.style.height = `${particle.size}px`
        el.style.transform = `translate(${x + fw / 2 - particle.size / 2}px, ${
          y + fh / 2 - particle.size / 2
        }px)`

        const nx = clamp(x / rx, -1, 1)
        el.style.background = mixHex(VIOLET_HEX, CYAN_HEX, (nx + 1) / 2)
      }

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [containerRef, blobRefs, clusterCenters, morphRef, blobCount])
}
