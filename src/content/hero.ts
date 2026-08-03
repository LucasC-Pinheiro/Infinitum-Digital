import type { Language } from './copy'

export interface HeroLine {
  text: string
  italic?: boolean
}

export interface HeroCopy {
  lines: HeroLine[]
  /** Rótulo acessível do SVG, já que o texto é desenhado como <text>. */
  alt: string
}

/** Primeira passagem — θ 000°. */
export const HERO: Record<Language, HeroCopy> = {
  pt: {
    lines: [{ text: 'Tecnologia' }, { text: 'que parece' }, { text: 'inevitável.', italic: true }],
    alt: 'Tecnologia que parece inevitável.',
  },
  en: {
    lines: [{ text: 'Technology' }, { text: 'that feels' }, { text: 'inevitable.', italic: true }],
    alt: 'Technology that feels inevitable.',
  },
}

/** Segunda passagem — depois de fechar o ciclo e voltar ao topo. */
export const HERO_SECOND_PASS: Record<Language, HeroCopy> = {
  pt: {
    lines: [{ text: 'Inevitável,' }, { text: 'então.', italic: true }],
    alt: 'Inevitável, então.',
  },
  en: {
    lines: [{ text: 'Inevitable,' }, { text: 'then.', italic: true }],
    alt: 'Inevitable, then.',
  },
}
