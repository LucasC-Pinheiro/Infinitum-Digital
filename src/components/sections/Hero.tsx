import { useCallback, useEffect, useMemo, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/env'
import { lemniscate } from '@/lib/field/math'
import { markLayoutDirty } from '@/lib/field/runtime'
import { HERO, HERO_SECOND_PASS } from '@/content/hero'
import { useLanguage } from '@/lib/i18n/useLanguage'

/** Largura útil do viewBox. Texto maior que isso encolhe — nunca estica. */
const MAX_TEXT_WIDTH = 97.5
const SWEEP_MS = 2300

/**
 * Geometria por número de linhas. A altura do viewBox acompanha o bloco de
 * texto em vez de ser fixa: com caixa fixa, duas linhas deixavam ~25% de vazio
 * dentro do SVG, e como a altura renderizada é presa à largura pela proporção
 * do viewBox, esse vazio empurrava o rodapé do hero para fora da dobra.
 */
const GEOMETRY = {
  2: { box: 47, fontSize: 23, y: [19, 43], carveY: 23.5, carveAmp: 1.33 },
  3: { box: 62, fontSize: 20.5, y: [19, 39.5, 60], carveY: 36, carveAmp: 1.75 },
} as const

/** Traço em lemniscata que serve de máscara para a versão iluminada do texto. */
function buildCarvePath(cy: number, ampY: number): string {
  let d = ''
  for (let i = 0; i <= 280; i++) {
    const t = (i / 280) * 6.2831
    const p = lemniscate(t, 54)
    d += `${i ? 'L' : 'M'}${(49 + p[0]).toFixed(2)} ${(cy + p[1] * ampY).toFixed(2)} `
  }
  return d.trim()
}

interface HeroProps {
  secondPass: boolean
}

export function Hero({ secondPass }: HeroProps) {
  const { t, lang } = useLanguage()
  const copy = secondPass ? HERO_SECOND_PASS[lang] : HERO[lang]

  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const carvedRef = useRef(false)
  const sweepTimer = useRef(0)
  const prevSecondPass = useRef(secondPass)

  const geo = copy.lines.length === 2 ? GEOMETRY[2] : GEOMETRY[3]
  const carveD = useMemo(() => buildCarvePath(geo.carveY, geo.carveAmp), [geo])

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

  // ...ou sozinho, logo depois de montar. O site abre direto no hero, sem
  // cortina antes, então o traço é a primeira coisa que acontece na página.
  useEffect(() => {
    const timer = window.setTimeout(carveOnce, 140)
    return () => window.clearTimeout(timer)
  }, [carveOnce])

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
      y={geo.y[i]}
      fontSize={geo.fontSize}
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

      {/* No desktop a divisão de quem-faz-o-quê ocupa a coluna livre à direita
          do título, e não uma faixa abaixo dele: o hero ganha a informação sem
          gastar altura, e a composição deixa de ser uma pilha centrada. */}
      <div className="heroBody">
        <div id="carveWrap">
          <svg
            ref={svgRef}
            id="heroSvg"
            viewBox={`0 0 100 ${geo.box}`}
            role="img"
            aria-label={copy.alt}
          >
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

        <p className="heroSub">{t('heroSub')}</p>
      </div>

      {/* Itens separados por régua de 1px, nunca por caractere: ponto médio e
          interponto estão fora do sistema de escrita (ver content/copy.ts). */}
      <div className="heroFoot">
        <ul className="ruled">
          <li>{t('heroCap1')}</li>
          <li>{t('heroCap2')}</li>
          <li>{t('heroCap3')}</li>
          <li>{t('heroCap4')}</li>
        </ul>
        <ul className="ruled" id="heroPass">
          {secondPass ? (
            <li>{t('heroSecondPass')}</li>
          ) : (
            <>
              <li>{t('heroPlace1')}</li>
              <li>{t('heroPlace2')}</li>
            </>
          )}
        </ul>
      </div>
    </section>
  )
}
