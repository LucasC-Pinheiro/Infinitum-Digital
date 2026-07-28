import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1)
  return outMin + (outMax - outMin) * t
}

export interface HeroScrollProgressElements {
  heroCopy: HTMLElement
  servicesCopy: HTMLElement
  panels: HTMLElement[]
  onMorphChange: (morph: number) => void
  onProgressChange: (progress: number) => void
}

/**
 * Port of the prototype's onScrollProgress(p): drives the hero fade-out,
 * the services panels' staggered reveal, the blob field's morph target,
 * and the progress rail — all from a single 0-1 pin progress value.
 */
export function applyHeroScrollProgress(
  p: number,
  els: HeroScrollProgressElements,
): void {
  const heroOpacity = 1 - mapRange(p, 0.16, 0.28, 0, 1)
  els.heroCopy.style.opacity = String(heroOpacity)
  els.heroCopy.style.transform = `translateY(${-30 * (1 - heroOpacity)}px)`

  const servicesOpacity = mapRange(p, 0.36, 0.46, 0, 1)
  els.servicesCopy.style.opacity = String(servicesOpacity)

  els.panels.forEach((panel, i) => {
    const start = 0.44 + i * 0.09
    const end = start + 0.14
    const panelOpacity = mapRange(p, start, end, 0, 1)
    panel.style.opacity = String(panelOpacity)
    panel.style.transform = `translateY(${(1 - panelOpacity) * 22}px)`
  })

  els.onMorphChange(mapRange(p, 0.22, 0.46, 0, 1))
  els.onProgressChange(p)
}

export interface SetupHeroScrollTriggerOptions {
  stage: HTMLElement
  stickyFrame: HTMLElement
  mobilePanelSelector: string
  onUpdate: (progress: number) => void
}

/**
 * Registers the desktop pin (>=900px) driving onUpdate, and the mobile
 * (<=899px) per-panel reveal-on-scroll fallback, matching the prototype's
 * ScrollTrigger.matchMedia split exactly (same breakpoint, same "+=220%").
 */
export function setupHeroScrollTrigger(
  opts: SetupHeroScrollTriggerOptions,
): void {
  ScrollTrigger.matchMedia({
    '(min-width: 900px)': () => {
      ScrollTrigger.create({
        trigger: opts.stage,
        start: 'top top',
        end: '+=220%',
        scrub: 1,
        pin: opts.stickyFrame,
        onUpdate: (self) => opts.onUpdate(self.progress),
      })
    },
    '(max-width: 899px)': () => {
      gsap.utils.toArray<HTMLElement>(opts.mobilePanelSelector).forEach((panel) => {
        gsap.to(panel, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: panel, start: 'top 88%' },
        })
      })
    },
  })
}

export interface HeroIntroElements {
  fieldWrapper: HTMLElement
  eyebrow: HTMLElement
  heading: HTMLElement
  subhead: HTMLElement
  ctaRow: HTMLElement
  reduceMotion: boolean
}

/** Port of the prototype's hero entrance timeline. */
export function playHeroIntro(els: HeroIntroElements): gsap.core.Timeline {
  const duration = (base: number) => (els.reduceMotion ? 0.01 : base)

  gsap.set([els.eyebrow, els.heading, els.subhead, els.ctaRow], {
    opacity: 0,
    y: 16,
  })
  gsap.set(els.fieldWrapper, { opacity: 0 })

  return gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .to(els.fieldWrapper, { opacity: 1, duration: duration(1) })
    .to(els.eyebrow, { opacity: 1, y: 0, duration: duration(0.6) }, '-=0.6')
    .to(els.heading, { opacity: 1, y: 0, duration: duration(0.8) }, '-=0.4')
    .to(els.subhead, { opacity: 1, y: 0, duration: duration(0.6) }, '-=0.5')
    .to(els.ctaRow, { opacity: 1, y: 0, duration: duration(0.5) }, '-=0.35')
}
