import { Rich } from '@/components/Rich'
import { useLanguage } from '@/lib/i18n/useLanguage'

/**
 * O cruzamento, θ 180°. A seção é mais alta que a tela e o conteúdo fica
 * grudado no meio dela: o scroll extra não rola texto nenhum, ele só segura a
 * leitura enquanto o campo puxa as duas alças para a origem e depois as solta.
 * É o único momento de tensão do percurso, e a altura extra é o que dá tempo
 * de a convergência acontecer e se desfazer: o campo troca de formação nas
 * costuras entre seções, então uma seção alta segura a forma por mais tempo
 * pela própria altura (ver `buildSteps` em field/layout.ts).
 */
export function Crossing() {
  const { t } = useLanguage()

  return (
    <section id="cross" data-state="4">
      <div id="crossInner">
        <div className="label r">
          <b>∞ 180°</b> <span>{t('crossLabel')}</span>
        </div>
        <Rich as="h2" className="r" data-d="1" text={t('crossH')} />
        <p className="body r" data-d="2">
          {t('crossP')}
        </p>
      </div>
    </section>
  )
}
