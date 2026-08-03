import { clamp, easeInOut } from './math'
import { STATE_COUNT } from './states'

export interface SectionLayout {
  /** Índice do estado do campo, vindo de data-state. */
  state: number
  top: number
  height: number
}

export interface LayoutCache {
  sections: SectionLayout[]
  collapseTop: number
  collapseHeight: number
  railWidth: number
  railMax: number
}

const EMPTY: LayoutCache = {
  sections: [],
  collapseTop: 0,
  collapseHeight: 1,
  railWidth: 1,
  railMax: 1,
}

/**
 * Mede tudo de uma vez e guarda. O loop nunca lê geometria do DOM direto —
 * só este ponto lê, e apenas quando marcado como sujo, para não forçar reflow
 * a cada frame.
 */
export function readLayout(rail: HTMLElement | null): LayoutCache {
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>('section[data-state]'),
  )
  if (nodes.length === 0) return EMPTY

  const collapse = document.getElementById('collapse')

  return {
    sections: nodes.map((el) => ({
      state: Number(el.dataset.state),
      top: el.offsetTop,
      height: el.offsetHeight || 1,
    })),
    collapseTop: collapse?.offsetTop ?? 0,
    collapseHeight: collapse?.offsetHeight || 1,
    railWidth: rail?.clientWidth || 1,
    railMax: Math.max(1, (rail?.scrollWidth ?? 1) - (rail?.clientWidth ?? 0)),
  }
}

export interface FieldProgress {
  /** Posição alvo no contínuo de estados, 0..STATE_COUNT-1. */
  target: number
  /** 0-1: quanto a página some para o campo assumir, durante a pausa. */
  eclipse: number
  /** Estamos no miolo da pausa (dispara o texto do #collapse). */
  deep: boolean
}

/**
 * Converte scroll absoluto em posição no ciclo. Cada seção segura o estado
 * por um trecho ("hold") antes de começar a transição para o próximo, para o
 * morph acontecer entre seções e não durante a leitura.
 */
export function computeProgress(
  scrollY: number,
  viewportHeight: number,
  layout: LayoutCache,
): FieldProgress {
  const mid = scrollY + viewportHeight * 0.5

  let index = 0
  let frac = 0
  for (const section of layout.sections) {
    if (mid >= section.top && mid < section.top + section.height) {
      index = section.state
      frac = (mid - section.top) / section.height
      break
    }
    if (mid >= section.top + section.height) {
      index = section.state
      frac = 1
    }
  }

  // A pausa segura por mais tempo: o ponto único precisa respirar.
  const hold = index === 5 ? 0.7 : 0.45
  const target = Math.min(
    index + (frac <= hold ? 0 : easeInOut((frac - hold) / (1 - hold))),
    STATE_COUNT - 1,
  )

  const cf = (mid - layout.collapseTop) / layout.collapseHeight
  const inside = cf > 0 && cf < 1

  return {
    target,
    eclipse: inside ? clamp(1 - Math.abs(cf - 0.5) / 0.42, 0, 1) : 0,
    deep: cf > 0.18 && cf < 0.82,
  }
}
