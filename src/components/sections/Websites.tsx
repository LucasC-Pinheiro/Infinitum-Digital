import { Rich } from '@/components/Rich'
import { useLanguage } from '@/lib/i18n/useLanguage'
import type { CopyKey } from '@/content/copy'

const FIGURES: { value: string; label: CopyKey; delay: string }[] = [
  { value: '1,4s', label: 's3f1', delay: '1' },
  { value: '60', label: 's3f2', delay: '2' },
  { value: '0', label: 's3f3', delay: '3' },
  { value: 'AA+', label: 's3f4', delay: '4' },
]

export function Websites() {
  const { t } = useLanguage()

  return (
    <section id="web" data-state="3">
      <div className="head">
        <div className="label r">
          <b>∞ 092°</b> <span>{t('s3label')}</span>
        </div>
        <Rich as="h2" className="r" data-d="1" text={t('s3h')} />
      </div>

      <div className="figures">
        {FIGURES.map((figure) => (
          <div key={figure.label} className="r" data-d={figure.delay}>
            <b>{figure.value}</b>
            <small>{t(figure.label)}</small>
          </div>
        ))}
      </div>
    </section>
  )
}
