import { clamp, easeInOut } from './math'
import { STATE_COUNT } from './states'

export interface SectionLayout {
  /** Índice do estado do campo, vindo de data-state. */
  state: number
  top: number
  height: number
}

/**
 * Retângulo de um bloco de texto, em coordenadas de página — `left` e
 * `width` já são estáveis (a página não rola na horizontal), mas `pageTop`
 * precisa ser recombinado com o scroll atual a cada frame para virar
 * coordenada de viewport, já que só remedimos quando `layoutDirty`.
 */
export interface TextRect {
  pageTop: number
  left: number
  width: number
  height: number
}

export interface LayoutCache {
  sections: SectionLayout[]
  collapseTop: number
  collapseHeight: number
  railWidth: number
  railMax: number
  /** Retângulos de texto principais por estado do campo — só os estados com
   * bug de legibilidade confirmado têm entrada aqui (ver TEXT_SELECTORS). */
  textRects: Record<number, TextRect[]>
}

const EMPTY: LayoutCache = {
  sections: [],
  collapseTop: 0,
  collapseHeight: 1,
  railWidth: 1,
  railMax: 1,
  textRects: {},
}

/**
 * Seção raiz + seletores dos blocos de texto principais por estado do campo
 * (ver lib/field/states.ts para o que cada índice representa). A raiz existe
 * porque classes como `.head` se repetem em várias seções — sem escopar a
 * busca a ela, `querySelectorAll` pega o `.head` de outras seções também e
 * estoura o orçamento de retângulos antes de chegar ao seletor certo. Um
 * estado sem entrada aqui simplesmente não participa da repulsão de texto.
 */
const TEXT_SELECTORS: Record<number, { root: string; selectors: string[] }> = {
  2: { root: '#auto', selectors: ['.head', '.loop'] },
  3: { root: '#web', selectors: ['.head', '.figures'] },
  4: { root: '#systems', selectors: ['.manifesto'] },
  5: { root: '#collapse', selectors: ['#collapseInner'] },
  6: { root: '#about', selectors: ['.head', '.slide .pad'] },
  7: { root: '#why', selectors: ['.head', '.caps'] },
  8: { root: '#cta', selectors: ['.ctaBlock'] },
}

/** Teto de retângulos ativos por estado — mantém o array de uniforms do shader pequeno. */
const MAX_TEXT_RECTS = 4

function readTextRects(): Record<number, TextRect[]> {
  const scrollY = window.scrollY
  const out: Record<number, TextRect[]> = {}
  for (const key of Object.keys(TEXT_SELECTORS)) {
    const state = Number(key)
    const { root, selectors } = TEXT_SELECTORS[state]
    const rootEl = document.querySelector<HTMLElement>(root)
    const rects: TextRect[] = []
    if (rootEl) {
      for (const selector of selectors) {
        const nodes = rootEl.querySelectorAll<HTMLElement>(selector)
        for (const el of nodes) {
          if (rects.length >= MAX_TEXT_RECTS) break
          const r = el.getBoundingClientRect()
          if (r.width < 1 || r.height < 1) continue
          rects.push({ pageTop: r.top + scrollY, left: r.left, width: r.width, height: r.height })
        }
      }
    }
    out[state] = rects
  }
  return out
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
    textRects: readTextRects(),
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
