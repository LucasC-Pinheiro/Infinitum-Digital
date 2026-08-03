import { Rich } from '@/components/Rich'
import { useLanguage } from '@/lib/i18n/useLanguage'
import type { CopyKey } from '@/content/copy'

const CAPABILITIES: CopyKey[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6']

export function Why() {
  const { t } = useLanguage()

  return (
    <section id="why" data-state="7">
      <div className="head">
        <div className="label r">
          <b>∞ 296°</b> <span>{t('s7label')}</span>
        </div>
        <Rich as="h2" className="r" data-d="1" text={t('s7h')} />
        <p className="body r" data-d="2">
          {t('s7p')}
        </p>
      </div>

      <div className="capsWrap">
        <div className="oneStroke" aria-hidden="true" />

        <div className="caps">
          {CAPABILITIES.map((key) => (
            <p key={key}>{t(key)}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
