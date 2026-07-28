import type { Ref } from 'react'
import { SERVICE_PANELS } from './servicePanels'

export interface ServicesDesktopPanelsProps {
  ref?: Ref<HTMLDivElement>
}

/**
 * The desktop scattered service panels. These are absolutely positioned
 * inside Act1Hero's pinned .sticky-frame (same DOM subtree as the hero
 * copy and blob field), so Act1Hero renders this directly and reads the
 * forwarded root + its .panel children to drive their scroll reveal —
 * see applyHeroScrollProgress in src/lib/scroll.ts.
 */
export function ServicesDesktopPanels({ ref }: ServicesDesktopPanelsProps) {
  return (
    <div ref={ref} className="services-copy">
      {SERVICE_PANELS.map((panel) => (
        <div key={panel.id} id={panel.id} className="panel">
          <div className="tag">[ {panel.tag} ]</div>
          <h3>{panel.title}</h3>
          <p>{panel.body}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Mobile fallback (stacked panels, no pin) plus the closing beat. The
 * per-panel reveal-on-scroll animation is registered from Act1Hero's
 * ScrollTrigger.matchMedia setup (src/lib/scroll.ts), targeting the
 * `.m-panel` class rendered here.
 */
export function Act2Services() {
  return (
    <>
      <div className="services-mobile">
        {SERVICE_PANELS.map((panel) => (
          <div key={panel.id} className="m-panel">
            <div className="tag">[ {panel.tag} ]</div>
            <h3>{panel.title}</h3>
            <p>{panel.body}</p>
          </div>
        ))}
      </div>

      <div className="next-act">
        <div className="line">ato 2 concluído — ato 3 (como trabalhamos) em construção</div>
        <div className="arrow">↓</div>
      </div>
    </>
  )
}
