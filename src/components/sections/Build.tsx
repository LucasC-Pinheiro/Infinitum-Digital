import { LoopList, type LoopItem } from '@/components/LoopList'
import { Rich } from '@/components/Rich'
import { useLanguage } from '@/lib/i18n/useLanguage'

/** Alça esquerda da lemniscata: o que se constrói. */
const ITEMS: LoopItem[] = [
  { title: 'buildT1', detail: 'buildD1' },
  { title: 'buildT2', detail: 'buildD2' },
  { title: 'buildT3', detail: 'buildD3' },
]

export function Build() {
  const { t } = useLanguage()

  return (
    <section id="build" data-state="2">
      <div className="head">
        <div className="label r">
          <b>∞ 041°</b> <span>{t('buildLabel')}</span>
        </div>
        <Rich as="h2" className="r" data-d="1" text={t('buildH')} />
        <p className="body r" data-d="2">
          {t('buildP')}
        </p>
      </div>

      <LoopList items={ITEMS} />
    </section>
  )
}
