import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { BlobField } from '@/liquid/BlobField'
import type { ClusterCenter } from '@/liquid/useBlobField'
import { Grain } from '@/components/Grain'
import { Cursor } from '@/components/Cursor'
import { ProgressRail, type ProgressRailHandle } from '@/components/ProgressRail'
import { ServicesDesktopPanels } from './Act2Services'
import {
  applyHeroScrollProgress,
  playHeroIntro,
  setupHeroScrollTrigger,
} from '@/lib/scroll'

const CLUSTER_CENTERS: ClusterCenter[] = [
  { x: 0.16, y: 0.28 },
  { x: 0.66, y: 0.13 },
  { x: 0.24, y: 0.72 },
  { x: 0.72, y: 0.6 },
]

export function Act1Hero() {
  const stageRef = useRef<HTMLElement>(null)
  const stickyFrameRef = useRef<HTMLDivElement>(null)
  const fieldWrapperRef = useRef<HTMLDivElement>(null)
  const heroCopyRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subheadRef = useRef<HTMLParagraphElement>(null)
  const ctaRowRef = useRef<HTMLDivElement>(null)
  const servicesCopyRef = useRef<HTMLDivElement>(null)
  const progressRailRef = useRef<ProgressRailHandle>(null)
  const morphRef = useRef(0)

  useGSAP(
    () => {
      const heroCopy = heroCopyRef.current
      const servicesCopy = servicesCopyRef.current
      const stage = stageRef.current
      const stickyFrame = stickyFrameRef.current
      const fieldWrapper = fieldWrapperRef.current
      const eyebrow = eyebrowRef.current
      const heading = headingRef.current
      const subhead = subheadRef.current
      const ctaRow = ctaRowRef.current

      if (
        !heroCopy ||
        !servicesCopy ||
        !stage ||
        !stickyFrame ||
        !fieldWrapper ||
        !eyebrow ||
        !heading ||
        !subhead ||
        !ctaRow
      ) {
        return
      }

      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      const panels = Array.from(
        servicesCopy.querySelectorAll<HTMLElement>('.panel'),
      )

      setupHeroScrollTrigger({
        stage,
        stickyFrame,
        mobilePanelSelector: '.m-panel',
        onUpdate: (p) => {
          applyHeroScrollProgress(p, {
            heroCopy,
            servicesCopy,
            panels,
            onMorphChange: (morph) => {
              morphRef.current = morph
            },
            onProgressChange: (progress) => {
              progressRailRef.current?.setProgress(progress)
            },
          })
        },
      })

      playHeroIntro({
        fieldWrapper,
        eyebrow,
        heading,
        subhead,
        ctaRow,
        reduceMotion,
      })

      document.documentElement.classList.add('enhanced')
    },
    // No `scope` here: it would auto-scope gsap.utils.toArray('.m-panel')
    // (in setupHeroScrollTrigger) to stageRef's subtree, but the mobile
    // fallback panels intentionally live outside the pinned stage.
    { dependencies: [] },
  )

  return (
    <>
      <Grain />
      <Cursor />
      <ProgressRail ref={progressRailRef} />

      <nav className="site-nav">
        <div className="logo-mark">
          <svg viewBox="0 0 60 40">
            <path
              d="M30,20 C30,12 23,6 15,6 C7,6 2,12 2,20 C2,28 7,34 15,34 C23,34 27,28 30,20 C33,12 37,6 45,6 C53,6 58,12 58,20 C58,28 53,34 45,34 C37,34 33,28 30,20 Z"
              fill="none"
              stroke="url(#navGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="navGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6D5EF5" />
                <stop offset="100%" stopColor="#22D3C5" />
              </linearGradient>
            </defs>
          </svg>
          <span>infinitum</span>
        </div>
        <ul className="nav-links">
          <li>
            <a href="#services">Serviços</a>
          </li>
          <li>
            <a href="#process">Como trabalhamos</a>
          </li>
          <li>
            <a href="#contact">Contato</a>
          </li>
        </ul>
        <a className="nav-cta" href="#contact">
          Falar com a gente
        </a>
      </nav>

      <section ref={stageRef} className="stage">
        <div ref={stickyFrameRef} className="sticky-frame">
          <svg className="fallback-loop" viewBox="0 0 480 400">
            <path
              d="M240,200 C240,140 190,100 140,100 C90,100 60,140 60,200 C60,260 90,300 140,300 C190,300 220,260 240,200 C260,140 290,100 340,100 C390,100 420,140 420,200 C420,260 390,300 340,300 C290,300 260,260 240,200 Z"
              fill="none"
              stroke="url(#fbGrad)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="fbGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6D5EF5" />
                <stop offset="100%" stopColor="#22D3C5" />
              </linearGradient>
            </defs>
          </svg>

          <BlobField
            ref={fieldWrapperRef}
            clusterCenters={CLUSTER_CENTERS}
            morphRef={morphRef}
          />

          <div ref={heroCopyRef} className="hero-copy">
            <div ref={eyebrowRef} className="eyebrow">
              tecnologia · automação · performance contínua
            </div>
            <h1 ref={headingRef}>
              Presença digital <span className="grad">sem fim</span>.
            </h1>
            <p ref={subheadRef} className="subhead">
              Criamos sites, aplicativos e sistemas de automação com tráfego
              pago integrado — pra sua empresa não parar de crescer nunca.
            </p>
            <div ref={ctaRowRef} className="cta-row">
              <a className="btn-primary" href="#contact">
                Iniciar projeto
              </a>
              <a className="btn-ghost" href="#services">
                Ver serviços
              </a>
            </div>
          </div>

          <ServicesDesktopPanels ref={servicesCopyRef} />
        </div>
      </section>
    </>
  )
}
