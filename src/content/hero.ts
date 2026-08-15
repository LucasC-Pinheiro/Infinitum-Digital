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

/**
 * Primeira passagem — θ 000°. A manchete é a própria lemniscata dita em
 * palavras: o ∞ atrás do texto passa a ilustrar a frase em vez de decorá-la.
 * O trabalho concreto fica no subtítulo, uma linha abaixo.
 */
export const HERO: Record<Language, HeroCopy> = {
  pt: {
    lines: [{ text: 'Tecnologia' }, { text: 'sem fim.', italic: true }],
    alt: 'Tecnologia sem fim.',
  },
  en: {
    lines: [{ text: 'Technology' }, { text: 'without end.', italic: true }],
    alt: 'Technology without end.',
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
