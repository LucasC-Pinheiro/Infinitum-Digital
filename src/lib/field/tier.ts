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
 * Escalonamento por capacidade do aparelho. Aparelho fraco, economia de dados
 * ou movimento reduzido desligam o WebGL inteiro — a página continua legível
 * sem ele, já que o campo é puramente atmosférico.
 */
export function resolveTier(): QualityTier {
  if (
    prefersReducedMotion ||
    saveData ||
    deviceMemory <= 2 ||
    (isCoarsePointer && cpuCores <= 2)
  ) {
    return { particles: 0, dpr: 1 }
  }
  if (isCoarsePointer || window.innerWidth < 700) {
    return deviceMemory <= 3 || cpuCores <= 4
      ? { particles: 1100, dpr: 1.1 }
      : { particles: 2200, dpr: 1.35 }
  }
  if (window.innerWidth < 1300) return { particles: 4200, dpr: 1.5 }
  return { particles: 8000, dpr: 1.9 }
}
