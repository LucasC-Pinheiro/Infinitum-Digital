import { useRef } from 'react'
import { Rich } from '@/components/Rich'
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from '@/content/contact'
import { isCoarsePointer } from '@/lib/env'
import { useLanguage } from '@/lib/i18n/useLanguage'

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`

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

      {/* Agrupa o texto e os links principais num único bloco — dá ao campo
          de partículas um retângulo estável para calcular a repulsão de
          texto (ver src/lib/field/layout.ts). */}
      <div className="ctaBlock">
        <Rich as="h2" className="ctaBig r" data-d="1" text={t('s8h')} />

        <a
          ref={magnetRef}
          className="magnet r"
          data-d="2"
          id="magnet"
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onPointerMove={attract}
          onPointerLeave={release}
        >
          <span>{t('s8b')}</span> <span aria-hidden="true">∞</span>
        </a>

        <a className="mailto r" data-d="3" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </div>

      <button type="button" id="close" className="r" data-d="4" onClick={onGoHome}>
        {t('s8c')}
      </button>
    </section>
  )
}
