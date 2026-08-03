import { useEffect, useState } from 'react'
import { easeInOut } from '@/lib/field/math'

const COUNT_MS = 900

/**
 * Cortina de abertura: conta θ de 000° a 360° e sai. Trava o scroll enquanto
 * está visível. Sob prefers-reduced-motion o App nem monta este componente.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [degrees, setDegrees] = useState(0)
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [removed, setRemoved] = useState(false)

  useEffect(() => {
    document.body.classList.add('locked')
    const start = performance.now()
    let raf = 0
    let exitTimer = 0
    let removeTimer = 0

    const step = (now: number) => {
      const p = Math.min(1, (now - start) / COUNT_MS)
      setProgress(p)
      setDegrees(Math.round(easeInOut(p) * 360))
      if (p < 1) {
        raf = requestAnimationFrame(step)
        return
      }
      exitTimer = window.setTimeout(() => {
        setLeaving(true)
        document.body.classList.remove('locked')
        onDone()
        removeTimer = window.setTimeout(() => setRemoved(true), 1000)
      }, 160)
    }
    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(exitTimer)
      window.clearTimeout(removeTimer)
      document.body.classList.remove('locked')
    }
  }, [onDone])

  if (removed) return null

  return (
    <div id="pre" className={leaving ? 'done' : undefined} aria-hidden="true">
      <div id="preName">Infinitum</div>
      <div id="preNum">θ {String(degrees).padStart(3, '0')}°</div>
      <div id="preBar" style={{ width: `${progress * 100}%` }} />
    </div>
  )
}
