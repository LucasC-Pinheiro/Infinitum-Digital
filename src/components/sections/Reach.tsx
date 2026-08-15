import { LoopList, type LoopItem } from '@/components/LoopList'
import { Rich } from '@/components/Rich'
import { useLanguage } from '@/lib/i18n/useLanguage'

/** Alça direita da lemniscata: o que se distribui. */
const ITEMS: LoopItem[] = [
  { title: 'reachT1', detail: 'reachD1' },
  { title: 'reachT2', detail: 'reachD2' },
  { title: 'reachT3', detail: 'reachD3' },
]

export function Reach() {
  const { t } = useLanguage()

  return (
    <section id="reach" data-state="6">
      <div className="head">
        <div className="label r">
          <b>∞ 245°</b> <span>{t('reachLabel')}</span>
        </div>
        <Rich as="h2" className="r" data-d="1" text={t('reachH')} />
        <p className="body r" data-d="2">
          {t('reachP')}
        </p>
      </div>

      <LoopList items={ITEMS} />
    </section>
  )
}
