import { useEffect } from 'react'
import { Automation } from '@/components/sections/Automation'
import { Build } from '@/components/sections/Build'
import { CallToAction } from '@/components/sections/CallToAction'
import { Crossing } from '@/components/sections/Crossing'
import { Hero } from '@/components/sections/Hero'
import { Process } from '@/components/sections/Process'
import { Reach } from '@/components/sections/Reach'
import { useFieldState } from '@/lib/field/useFieldState'
import { markLayoutDirty } from '@/lib/field/runtime'
import { useRevealOnScroll } from '@/lib/useRevealOnScroll'

interface HomeProps {
  secondPass: boolean
  onGoHome: () => void
}

/**
 * A home percorre a lemniscata inteira: alça de construção (θ 041 e 093),
 * cruzamento (θ 180), o trilho do processo (θ 210), alça de aquisição
 * (θ 245) e fechamento (θ 320).
 */
export function Home({ secondPass }: HomeProps) {
  const { setMode } = useFieldState()

  useRevealOnScroll()

  useEffect(() => {
    setMode('scroll')
    markLayoutDirty()
  }, [setMode])

  return (
    <main id="main">
      <Hero secondPass={secondPass} />
      <Build />
      <Automation />
      <Crossing />
      <Process />
      <Reach />
      <CallToAction />
    </main>
  )
}
