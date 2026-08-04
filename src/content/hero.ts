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
 * Primeira passagem — θ 000°.
 *
 * "Tecnologia que parece inevitável" continua sendo a assinatura da marca, mas
 * vive no rótulo mono acima do título: a manchete precisa dizer o que a dupla
 * entrega, não só como isso soa.
 */
export const HERO: Record<Language, HeroCopy> = {
  pt: {
    lines: [{ text: 'Duas pessoas.' }, { text: 'O processo inteiro.', italic: true }],
    alt: 'Duas pessoas. O processo inteiro.',
  },
  en: {
    lines: [{ text: 'Two people.' }, { text: 'The whole process.', italic: true }],
    alt: 'Two people. The whole process.',
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
