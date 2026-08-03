import { useCallback, useEffect, useRef } from 'react'
import { Rich } from '@/components/Rich'
import { ABOUT } from '@/content/about'
import { buzz, isCoarsePointer, prefersReducedMotion } from '@/lib/env'
import { clamp } from '@/lib/field/math'
import { fieldRuntime, markLayoutDirty, noteActivity } from '@/lib/field/runtime'
import { useLanguage } from '@/lib/i18n/useLanguage'

/**
 * Sobre — mesma mecânica de trilho horizontal com scroll-snap da seção que
 * ocupava este lugar no protótipo. O deslocamento do trilho também empurra o
 * campo de partículas lateralmente, então rolar aqui move o ∞ junto.
 */
export function About() {
  const { t, lang } = useLanguage()
  const slides = ABOUT[lang]

  const railRef = useRef<HTMLDivElement>(null)
  const metrics = useRef({ width: 1, max: 1 })
  const indexRef = useRef(0)
  const drag = useRef({ active: false, startX: 0, startLeft: 0 })

  const measure = useCallback(() => {
    const el = railRef.current
    if (!el) return
    metrics.current = {
      width: el.clientWidth || 1,
      max: Math.max(1, el.scrollWidth - el.clientWidth),
    }
  }, [])

  useEffect(() => {
    measure()
    markLayoutDirty()
  }, [measure, slides])

  useEffect(() => {
    let timer = 0
    const onResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(measure, 180)
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [measure])

  // O arrasto solta fora do trilho, então o pointerup mora na janela.
  useEffect(() => {
    const stop = () => {
      drag.current.active = false
      railRef.current?.classList.remove('drag')
    }
    window.addEventListener('pointerup', stop)
    return () => window.removeEventListener('pointerup', stop)
  }, [])

  const handleScroll = () => {
    const el = railRef.current
    if (!el) return
    noteActivity()
    fieldRuntime.railOffset = el.scrollLeft / metrics.current.max - 0.5
    const i = Math.round(el.scrollLeft / metrics.current.width)
    if (i === indexRef.current) return
    indexRef.current = i
    buzz(9)
    fieldRuntime.pulse = Math.max(fieldRuntime.pulse, 0.55)
    // O retângulo de texto do slide ativo (usado pela repulsão do campo)
    // muda de posição horizontal quando o trilho troca de slide.
    markLayoutDirty()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = clamp(
      indexRef.current + (e.key === 'ArrowRight' ? 1 : -1),
      0,
      slides.length - 1,
    )
    railRef.current?.scrollTo({
      left: metrics.current.width * next,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isCoarsePointer || !railRef.current) return
    drag.current = {
      active: true,
      startX: e.clientX,
      startLeft: railRef.current.scrollLeft,
    }
    railRef.current.classList.add('drag')
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || !railRef.current) return
    railRef.current.scrollLeft =
      drag.current.startLeft - (e.clientX - drag.current.startX) * 1.5
  }

  return (
    <section id="about" data-state="6">
      <div className="inner head">
        <div className="label r">
          <b>∞ 245°</b> <span>{t('s6label')}</span>
        </div>
        <Rich as="h2" className="r" data-d="1" text={t('s6h')} />
      </div>

      <div
        ref={railRef}
        className="rail"
        id="rail"
        role="region"
        aria-label={`${t('s6label')}. ${t('s6hint')}.`}
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        {slides.map((slide, i) => (
          <article key={slide.id} className="slide">
            <div className="pad">
              <div className="sIdx">
                ∞ {String(i + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </div>
              {slide.photo && (
                <img
                  className="sPhoto"
                  src={slide.photo}
                  alt={slide.photoAlt ?? ''}
                  width={132}
                  height={165}
                  loading="lazy"
                  decoding="async"
                />
              )}
              <h3 className="sName">{slide.name}</h3>
              <p className="sOut">{slide.role}</p>
              <p className="sBio">{slide.bio}</p>
              <div className="sMeta">
                {slide.meta.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
