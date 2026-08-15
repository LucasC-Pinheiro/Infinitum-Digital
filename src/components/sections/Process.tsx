import { useCallback, useEffect, useRef, useState } from 'react'
import { Rich } from '@/components/Rich'
import { prefersReducedMotion } from '@/lib/env'
import { clamp } from '@/lib/field/math'
import { markLayoutDirty } from '@/lib/field/runtime'
import { useLanguage } from '@/lib/i18n/useLanguage'
import type { CopyKey } from '@/content/copy'

interface Stop {
  title: CopyKey
  body: CopyKey
}

/** As quatro paradas do processo, na ordem em que o trilho as percorre. */
const STOPS: Stop[] = [
  { title: 'processStop1Title', body: 'processStop1Body' },
  { title: 'processStop2Title', body: 'processStop2Body' },
  { title: 'processStop3Title', body: 'processStop3Body' },
  { title: 'processStop4Title', body: 'processStop4Body' },
]

/** Mesmo ponto de corte usado em `nav`/`.founder` no CSS. */
const DESKTOP_QUERY = '(min-width: 900px)'

/**
 * θ 210°, entre o cruzamento e o tráfego pago: a lemniscata se estica numa
 * linha reta (ver o estado 5 em `field/states.ts`) e essa linha vira o trilho
 * do scroll horizontal das quatro paradas do processo.
 *
 * A contenção vertical é `position: sticky`, do CSS, e não um pin de
 * biblioteca. Um pin insere um espaçador no documento e desloca o `offsetTop`
 * de tudo que vem depois, que era a causa provável de a navegação por âncora
 * não chegar ao destino, além de ser o ponto mais frágil em Safari iOS. Com
 * sticky o documento continua com a altura real, o gesto de rolagem segue
 * nativo, e a única coisa que o JavaScript faz é ler o progresso da seção e
 * escrever um `translateX` no trilho.
 *
 * O cabeçalho fica dentro da área sticky de propósito: enquanto o trilho
 * corre, o título continua na tela. Sem isso a seção passava por um viewport
 * inteiro sem texto nenhum, que é onde o visitante desiste.
 *
 * Caminho de saída: o modo trilho só liga quando existe sobra horizontal de
 * fato (`data-rail` na seção). Em tela estreita, sob `prefers-reduced-motion`,
 * ou se a medição falhar, o atributo não é escrito e o CSS mantém as quatro
 * paradas em fluxo vertical normal, com o mesmo traço único do resto do site.
 */
export function Process() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const stopRefs = useRef<Array<HTMLElement | null>>([])
  const [railOn, setRailOn] = useState(false)
  const [active, setActive] = useState(0)

  /**
   * Quanto o trilho precisa correr na horizontal, em pixels.
   *
   * A fila de paradas só vira linha quando `data-rail` está na seção, e é
   * justamente `data-rail` que esta medida decide — medir com o layout
   * vertical daria sobra zero e o modo trilho nunca ligaria. Por isso o
   * atributo é escrito antes de medir, como sonda. A escrita direta no DOM é
   * deliberada e segura aqui porque acontece e se desfaz dentro do mesmo bloco
   * síncrono, sem render do React no meio, e o estado devolvido logo abaixo
   * reconcilia o atributo com o que o React vai renderizar.
   */
  const measure = useCallback(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return 0

    const had = section.hasAttribute('data-rail')
    section.setAttribute('data-rail', '')
    const prevTransform = track.style.transform
    track.style.transform = ''

    // Sobra = largura da fila menos o espaço visível a partir de onde ela
    // começa. Sem descontar a folga da direita, a última parada encostaria na
    // borda da tela em vez de assentar dentro da margem do site.
    const left = track.getBoundingClientRect().left
    const endPad = left
    const visible = Math.max(1, window.innerWidth - left - endPad)
    const travel = Math.max(0, Math.round(track.scrollWidth - visible))

    track.style.transform = prevTransform
    if (!had && travel <= 0) section.removeAttribute('data-rail')
    return travel
  }, [])

  // ---- modo trilho: sticky + translateX amarrado ao progresso da seção -----
  useEffect(() => {
    if (prefersReducedMotion) return

    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    let travel = 0
    let raf = 0
    let enabled = false

    const layout = () => {
      const wide = window.matchMedia(DESKTOP_QUERY).matches
      travel = wide ? measure() : 0
      enabled = travel > 0
      // A altura extra da seção é exatamente a distância horizontal a
      // percorrer: assim o trilho anda 1:1 com o dedo/roda, sem acelerar nem
      // arrastar em relação ao gesto.
      section.style.setProperty('--rail-travel', `${travel}px`)
      setRailOn(enabled)
      if (!enabled) track.style.transform = ''
      // A altura da seção mudou, e é ela que define até onde o campo segura a
      // formação do trilho: as costuras da linha do tempo saem do `offsetTop`
      // das seções (ver `buildSteps` em field/layout.ts). Sem remedir, o traço
      // se desfaria no meio da rolagem horizontal.
      markLayoutDirty()
    }

    const apply = () => {
      raf = 0
      if (!enabled) return
      const top = section.offsetTop
      const span = section.offsetHeight - window.innerHeight
      if (span <= 0) return
      const progress = clamp((window.scrollY - top) / span, 0, 1)
      track.style.transform = `translate3d(${-travel * progress}px,0,0)`
      const idx = Math.round(progress * (STOPS.length - 1))
      setActive((cur) => (cur === idx ? cur : idx))
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(apply)
    }

    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        layout()
        apply()
      }, 180)
    }

    // A primeira medição espera um frame: medir dentro do efeito seria ler
    // geometria antes da primeira pintura, e ainda forçaria um render extra
    // no mesmo tique.
    const first = requestAnimationFrame(() => {
      layout()
      apply()
    })
    // Serifa grande muda de métrica entre a fonte de fallback e a real, o que
    // muda a largura do trilho. Remede quando as fontes chegarem.
    void document.fonts?.ready.then(() => {
      layout()
      apply()
    })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      cancelAnimationFrame(first)
      if (raf) cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      section.style.removeProperty('--rail-travel')
      track.style.transform = ''
    }
  }, [measure])

  // ---- fluxo vertical: marcador ativo acompanha o scroll -------------------
  useEffect(() => {
    if (railOn) return
    const stops = stopRefs.current.filter((el): el is HTMLElement => el !== null)
    if (stops.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        let best = -1
        let bestRatio = 0
        for (const entry of entries) {
          const idx = stops.indexOf(entry.target as HTMLElement)
          if (idx !== -1 && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio
            best = idx
          }
        }
        if (best !== -1) setActive(best)
      },
      { threshold: [0.3, 0.5, 0.7, 0.9] },
    )
    stops.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [railOn])

  /**
   * Teclado. No modo trilho a parada focada não está onde o navegador acha que
   * está — ela é movida por transform — então o scroll nativo levaria ao lugar
   * errado. Aqui a posição é resolvida pelo progresso da seção, que é a mesma
   * conta que desenha o trilho. Em fluxo vertical o scroll nativo já resolve.
   */
  const onStopFocus = useCallback(
    (i: number) => {
      const section = sectionRef.current
      if (!railOn || !section) return
      const span = section.offsetHeight - window.innerHeight
      if (span <= 0) return
      window.scrollTo({
        top: section.offsetTop + (i / (STOPS.length - 1)) * span,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      })
    },
    [railOn],
  )

  return (
    <section id="process" data-state="5" data-rail={railOn ? '' : undefined} ref={sectionRef}>
      <div className="processPin">
        <div className="processInner">
          <div className="head">
            <div className="label r">
              <b>∞ 210°</b> <span>{t('processLabel')}</span>
            </div>
            <Rich as="h2" className="r" data-d="1" text={t('processH')} />
          </div>

          {/* O trilho visível é estático e vive fora do elemento que se move:
              é ele que ancora os marcadores e alinha com a linha do campo de
              partículas. O que corre é só a fila de paradas, por baixo. */}
          <div className="processRail" aria-hidden="true" />

          <div className="processTrack" ref={trackRef}>
            {STOPS.map((stop, i) => (
              <article
                key={stop.title}
                className="stop r"
                data-d={String(Math.min(i + 1, 4))}
                tabIndex={0}
                onFocus={() => onStopFocus(i)}
                ref={(el) => {
                  stopRefs.current[i] = el
                }}
              >
                <span className="stopMarker" aria-hidden="true" />
                <span className="stopNum">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="stopTitle">{t(stop.title)}</h3>
                <p className="stopBody">{t(stop.body)}</p>
              </article>
            ))}
          </div>

          <div className="processProgress" aria-hidden="true">
            {STOPS.map((stop, i) => (
              <span key={stop.title} className={i === active ? 'on' : undefined} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
