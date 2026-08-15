import { useState } from 'react'
import { bumpFlow } from '@/lib/field/runtime'
import { useLanguage } from '@/lib/i18n/useLanguage'
import type { CopyKey } from '@/content/copy'

export interface LoopItem {
  title: CopyKey
  detail: CopyKey
}

/**
 * Lista tipográfica das seções de trabalho. Número em Plex Mono, título em
 * Instrument Serif, descrição em Inter Tight, régua de 1px separando. Sem
 * caixa, sem fundo, sem borda em volta.
 *
 * O hover não toca em opacity, e isso é deliberado: era exatamente aí que a
 * linha sumia. O estado ativo vai por `data-on`, um atributo, e nunca por
 * className — o marcador de reveal é gravado no DOM fora do React, e reescrever
 * a classe apagaria ele (ver useRevealOnScroll). O efeito visível é o tique
 * âmbar deslocando alguns pixels e a régua ganhando peso.
 */
export function LoopList({ items }: { items: LoopItem[] }) {
  const { t } = useLanguage()
  // :hover cobre o mouse; este estado existe para o toque, onde não há hover.
  const [active, setActive] = useState<number | null>(null)

  const light = (i: number) => {
    setActive(i)
    bumpFlow(0.5)
  }

  return (
    <ul className="loop">
      {items.map((item, i) => (
        <li
          key={item.title}
          className="r"
          data-d={String(i + 2)}
          data-on={active === i ? '' : undefined}
          onPointerEnter={() => light(i)}
          onPointerDown={() => light(i)}
          onPointerLeave={() => setActive((cur) => (cur === i ? null : cur))}
        >
          <span className="lTick" aria-hidden="true" />
          <span className="lk">{String(i + 1).padStart(2, '0')}</span>
          <div>
            <div className="lt">{t(item.title)}</div>
            <div className="ld">{t(item.detail)}</div>
          </div>
        </li>
      ))}
    </ul>
  )
}
