import { Rich } from '@/components/Rich'
import { buzz } from '@/lib/env'
import { requestPulse } from '@/lib/field/runtime'
import { useLanguage } from '@/lib/i18n/useLanguage'

export function Systems() {
  const { t } = useLanguage()

  return (
    <section id="systems" data-state="4">
      <div className="label r">
        <b>∞ 143°</b> <span>{t('s4label')}</span>
      </div>

      <Rich as="p" className="manifesto r" data-d="1" text={t('s4m')} />

      <button
        type="button"
        id="pulse"
        className="pulseBtn r"
        data-d="2"
        onClick={() => {
          requestPulse()
          buzz(12)
        }}
      >
        {t('s4b')}
      </button>
    </section>
  )
}
