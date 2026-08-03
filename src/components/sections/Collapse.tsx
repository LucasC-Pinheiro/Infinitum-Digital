import { Rich } from '@/components/Rich'
import { collapseDeep, useSignal } from '@/lib/field/signals'
import { useLanguage } from '@/lib/i18n/useLanguage'

/**
 * A pausa. Duas telas de altura em que o campo colapsa num ponto único e a
 * página inteira some (o eclipse), até só sobrar esta frase.
 */
export function Collapse() {
  const { t } = useLanguage()
  const deep = useSignal(collapseDeep)

  return (
    <section id="collapse" data-state="5" aria-label="Pausa">
      <div id="collapseInner" className={deep ? 'deep' : undefined}>
        <Rich as="p" id="collapseLine" text={t('s5l')} />
        <p id="collapseSub">{t('s5s')}</p>
      </div>
    </section>
  )
}
