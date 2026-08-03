import { useState } from 'react'
import { Rich } from '@/components/Rich'
import { bumpFlow } from '@/lib/field/runtime'
import { useLanguage } from '@/lib/i18n/useLanguage'
import type { CopyKey } from '@/content/copy'

interface LoopStep {
  key: CopyKey
  title: CopyKey
  detail: CopyKey
  delay: string
}

const STEPS: LoopStep[] = [
  { key: 's2k1', title: 's2t1', detail: 's2d1', delay: '2' },
  { key: 's2k2', title: 's2t2', detail: 's2d2', delay: '3' },
  { key: 's2k3', title: 's2t3', detail: 's2d3', delay: '4' },
]

export function Automation() {
  const { t } = useLanguage()
  // :hover cobre o mouse; este estado existe para o toque, onde não há hover.
  const [active, setActive] = useState<number | null>(null)

  const light = (i: number) => {
    setActive(i)
    bumpFlow(0.5)
  }

  return (
    <section id="auto" data-state="2">
      <div className="head">
        <div className="label r">
          <b>∞ 041°</b> <span>{t('s2label')}</span>
        </div>
        <Rich as="h2" className="r" data-d="1" text={t('s2h')} />
        <p className="body r" data-d="2">
          {t('s2p')}
        </p>
      </div>

      <ul className="loop">
        {STEPS.map((step, i) => (
          <li
            key={step.key}
            className={`r${active === i ? ' on' : ''}`}
            data-d={step.delay}
            onPointerEnter={() => light(i)}
            onPointerDown={() => light(i)}
            onPointerLeave={() => setActive((cur) => (cur === i ? null : cur))}
          >
            <span className="lk">{t(step.key)}</span>
            <div>
              <div className="lt">{t(step.title)}</div>
              <div className="ld">{t(step.detail)}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
