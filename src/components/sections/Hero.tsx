import { useCallback, useEffect, useMemo, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/env'
import { lemniscate } from '@/lib/field/math'
import { markLayoutDirty } from '@/lib/field/runtime'
import { HERO, HERO_SECOND_PASS } from '@/content/hero'
import { useLanguage } from '@/lib/i18n/useLanguage'

/** Largura útil do viewBox. Texto maior que isso encolhe — nunca estica. */
const MAX_TEXT_WIDTH = 97.5
const THREE_LINE_Y = [19, 39.5, 60]
const TWO_LINE_Y = [26, 53]
const SWEEP_MS = 2300

/** Traço em lemniscata que serve de máscara para a versão iluminada do texto. */
function buildCarvePath(): string {
  let d = ''
  for (let i = 0; i <= 280; i++) {
    const t = (i / 280) * 6.2831
    const p = lemniscate(t, 54)
    d += `${i ? 'L' : 'M'}${(49 + p[0]).toFixed(2)} ${(36 + p[1] * 1.75).toFixed(2)} `
  }
  return d.trim()
}

interface HeroProps {
  /** A cortina saiu; pode começar a contar para o traço automático. */
  booted: boolean
  secondPass: boolean
}

export function Hero({ booted, secondPass }: HeroProps) {
  const { t, lang } = useLanguage()
  const copy = secondPass ? HERO_SECOND_PASS[lang] : HERO[lang]

  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const carvedRef = useRef(false)
  const sweepTimer = useRef(0)
  const prevSecondPass = useRef(secondPass)

  const carveD = useMemo(() => buildCarvePath(), [])
  const twoLines = copy.lines.length === 2
  const fontSize = twoLines ? 23 : 20.5
  const yFor = (i: number) => (twoLines ? TWO_LINE_Y[i] : THREE_LINE_Y[i])

  /** Encolhe a linha que estourar a caixa. Nunca alarga: esticar deforma. */
  const fit = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.querySelectorAll<SVGTextElement>('text').forEach((node) => {
      node.removeAttribute('textLength')
      node.removeAttribute('lengthAdjust')
      let length: number
      try {
        length = node.getComputedTextLength()
      } catch {
        return // nó ainda fora do layout
      }
      if (length > MAX_TEXT_WIDTH) {
        node.setAttribute('textLength', String(MAX_TEXT_WIDTH))
        node.setAttribute('lengthAdjust', 'spacingAndGlyphs')
      }
    })
  }, [])

  const sweep = useCallback((delay: number) => {
    const path = pathRef.current
    if (!path) return
    const length = path.getTotalLength()
    path.style.transition = 'none'
    path.style.strokeDasharray = String(length)
    path.style.strokeDashoffset = String(length)
    void path.getBoundingClientRect() // força o reflow antes de religar a transição
    if (prefersReducedMotion) {
      path.style.strokeDashoffset = '0'
      return
    }
    window.clearTimeout(sweepTimer.current)
    sweepTimer.current = window.setTimeout(() => {
      path.style.transition = `stroke-dashoffset ${SWEEP_MS}ms cubic-bezier(.19,.72,.2,1)`
      path.style.strokeDashoffset = '0'
    }, delay)
  }, [])

  const carveOnce = useCallback(() => {
    if (carvedRef.current) return
    carvedRef.current = true
    sweep(80)
  }, [sweep])

  // Ajusta ao trocar de idioma / passagem, e quando as fontes chegam.
  useEffect(() => {
    fit()
  }, [fit, copy])

  useEffect(() => {
    document.fonts?.ready.then(() => {
      fit()
      markLayoutDirty()
    })
    let timer = 0
    const onResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(fit, 180)
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [fit])

  // O traço nasce no primeiro sinal de vida do usuário.
  useEffect(() => {
    const events = [
      'pointerdown',
      'pointermove',
      'touchstart',
      'wheel',
      'keydown',
      'scroll',
    ] as const
    events.forEach((ev) =>
      window.addEventListener(ev, carveOnce, { once: true, passive: true }),
    )
    return () => events.forEach((ev) => window.removeEventListener(ev, carveOnce))
  }, [carveOnce])

  // ...ou sozinho, 1,2s depois que a cortina sai.
  useEffect(() => {
    if (!booted) return
    const timer = window.setTimeout(carveOnce, 1200)
    return () => window.clearTimeout(timer)
  }, [booted, carveOnce])

  // Texto novo pede traço novo — mas só depois que o primeiro já aconteceu.
  useEffect(() => {
    const enteringSecondPass = prevSecondPass.current !== secondPass
    prevSecondPass.current = secondPass
    if (!carvedRef.current) return
    sweep(enteringSecondPass ? 120 : 60)
  }, [copy, secondPass, sweep])

  useEffect(() => () => window.clearTimeout(sweepTimer.current), [])

  const lines = copy.lines.map((line, i) => (
    <text
      key={line.text}
      x="0"
      y={yFor(i)}
      fontSize={fontSize}
      className={line.italic ? 'ital' : undefined}
    >
      {line.text}
    </text>
  ))

  return (
    <section id="hero" data-state="1">
      <div>
        <div className="label">
          <b>∞ 000°</b> <span>{t('heroEyebrow')}</span>
        </div>
      </div>

      <div id="carveWrap">
        <svg ref={svgRef} id="heroSvg" viewBox="0 0 100 62" role="img" aria-label={copy.alt}>
          <defs>
            <mask id="carve">
              <path ref={pathRef} id="carvePath" d={carveD} />
            </mask>
          </defs>
          <g className="baseT" id="baseT">
            {lines}
          </g>
          <g className="litT" id="litT" mask="url(#carve)">
            {lines}
          </g>
        </svg>
      </div>

      <div className="heroFoot">
        <span>{t('heroCaps')}</span>
        <span id="heroPass">{secondPass ? t('heroSecondPass') : t('heroPlace')}</span>
      </div>
    </section>
  )
}
