import {
  cpuCores,
  deviceMemory,
  isCoarsePointer,
  prefersReducedMotion,
  saveData,
} from '@/lib/env'

export interface QualityTier {
  /** Número de partículas. Zero desliga o campo por completo. */
  particles: number
  /** Teto de devicePixelRatio no renderer. */
  dpr: number
}

/**
 * Escalonamento por capacidade do aparelho. Aparelho fraco ou economia de
 * dados desligam o WebGL inteiro — a página continua legível sem ele, já que
 * o campo é puramente atmosférico.
 *
 * Movimento reduzido não desliga: desenha um quadro só, na forma de repouso.
 * A contagem cai porque nada ali se move, então densidade alta só custaria
 * bateria sem entregar nada. Escalonar por partícula, e nunca cortar o efeito,
 * é o que mantém a mesma página para todo mundo.
 */
export function resolveTier(): QualityTier {
  if (saveData || deviceMemory <= 2 || (isCoarsePointer && cpuCores <= 2)) {
    return { particles: 0, dpr: 1 }
  }
  if (prefersReducedMotion) return { particles: 2600, dpr: 1.4 }
  if (isCoarsePointer || window.innerWidth < 700) {
    return deviceMemory <= 3 || cpuCores <= 4
      ? { particles: 1100, dpr: 1.1 }
      : { particles: 2200, dpr: 1.35 }
  }
  if (window.innerWidth < 1300) return { particles: 4200, dpr: 1.5 }
  return { particles: 8000, dpr: 1.9 }
}
