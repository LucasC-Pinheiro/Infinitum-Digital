import { useCallback, useEffect, useRef, useState } from 'react'
import { InfinityField } from '@/components/InfinityField'
import { Nav } from '@/components/Nav'
import { Preloader } from '@/components/Preloader'
import { SiteFooter } from '@/components/SiteFooter'
import { About } from '@/components/sections/About'
import { Automation } from '@/components/sections/Automation'
import { CallToAction } from '@/components/sections/CallToAction'
import { Collapse } from '@/components/sections/Collapse'
import { Hero } from '@/components/sections/Hero'
import { Systems } from '@/components/sections/Systems'
import { Websites } from '@/components/sections/Websites'
import { Why } from '@/components/sections/Why'
import { prefersReducedMotion } from '@/lib/env'
import { markLayoutDirty } from '@/lib/field/runtime'
import { useLanguage } from '@/lib/i18n/useLanguage'
import { useRevealOnScroll } from '@/lib/useRevealOnScroll'

/** Espera o scroll suave chegar ao topo antes de trocar o texto do hero. */
const SECOND_PASS_DELAY = 900

export default function App() {
  const { t, lang } = useLanguage()
  const [booted, setBooted] = useState(prefersReducedMotion)
  const [secondPass, setSecondPass] = useState(false)
  const secondPassRequested = useRef(false)

  useRevealOnScroll()

  // Texto novo muda a altura das seções; o campo precisa remedir.
  useEffect(() => {
    markLayoutDirty()
  }, [lang])

  /**
   * Fecha o ciclo: volta ao topo e, na primeira vez, troca o hero para a
   * segunda passagem — θ 360° vira o novo θ 000°.
   */
  const handleBooted = useCallback(() => setBooted(true), [])

  const goHome = useCallback(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    if (secondPassRequested.current) return
    secondPassRequested.current = true
    window.setTimeout(
      () => setSecondPass(true),
      prefersReducedMotion ? 0 : SECOND_PASS_DELAY,
    )
  }, [])

  return (
    <>
      <a className="skip" href="#hero">
        {t('skip')}
      </a>

      <InfinityField />
      <div id="vignette" aria-hidden="true" />

      {!prefersReducedMotion && <Preloader onDone={handleBooted} />}

      <Nav onGoHome={goHome} />

      <main id="main">
        <Hero booted={booted} secondPass={secondPass} />
        <Automation />
        <Websites />
        <Systems />
        <Collapse />
        <About />
        <Why />
        <CallToAction onGoHome={goHome} />
      </main>

      <SiteFooter />
    </>
  )
}
