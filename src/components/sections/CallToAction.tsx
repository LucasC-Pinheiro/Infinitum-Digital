import { useRef } from 'react'
import { Rich } from '@/components/Rich'
import { isCoarsePointer } from '@/lib/env'
import { useLanguage } from '@/lib/i18n/useLanguage'

export const CONTACT_EMAIL = 'ola@infinitum.digital'

export function CallToAction({ onGoHome }: { onGoHome: () => void }) {
  const { t } = useLanguage()
  const magnetRef = useRef<HTMLAnchorElement>(null)

  // O botão principal segue levemente o cursor. Sem efeito no toque.
  const attract = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = magnetRef.current
    if (!el || isCoarsePointer) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * 0.2
    const y = (e.clientY - r.top - r.height / 2) * 0.3
    el.style.transform = `translate(${x}px, ${y}px)`
  }

  const release = () => {
    if (magnetRef.current) magnetRef.current.style.transform = ''
  }

  return (
    <section id="cta" data-state="8">
      <div className="label r" style={{ justifyContent: 'center' }}>
        <b>∞ 360°</b> <span>{t('s8label')}</span>
      </div>

      <Rich as="h2" className="ctaBig r" data-d="1" text={t('s8h')} />

      <a
        ref={magnetRef}
        className="magnet r"
        data-d="2"
        id="magnet"
        href={`mailto:${CONTACT_EMAIL}`}
        onPointerMove={attract}
        onPointerLeave={release}
      >
        <span>{t('s8b')}</span> <span aria-hidden="true">∞</span>
      </a>

      <a className="mailto r" data-d="3" href={`mailto:${CONTACT_EMAIL}`}>
        {CONTACT_EMAIL}
      </a>

      <button type="button" id="close" className="r" data-d="4" onClick={onGoHome}>
        {t('s8c')}
      </button>
    </section>
  )
}
