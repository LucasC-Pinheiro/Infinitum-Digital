/**
 * Capacidades do dispositivo, lidas uma única vez no carregamento — igual ao
 * protótipo, que também não reavalia depois. Trocar de tier no meio da sessão
 * exigiria reconstruir a geometria do campo inteiro.
 */

declare global {
  interface Navigator {
    /** Não-padrão, só Chromium. GB de RAM, arredondado. */
    deviceMemory?: number
    connection?: { saveData?: boolean }
  }
}

const matches = (query: string): boolean =>
  typeof window !== 'undefined' && window.matchMedia(query).matches

export const prefersReducedMotion = matches('(prefers-reduced-motion: reduce)')
export const isCoarsePointer = matches('(pointer: coarse)')

/**
 * Se a seção de processo roda como trilho horizontal.
 *
 * Lido uma vez no carregamento, como as demais capacidades deste arquivo: a
 * geometria do campo é construída uma só vez e depende disso. Três lugares
 * precisam concordar sobre a resposta — a formação do estado 5, quais blocos
 * de texto o campo contorna ali, e o próprio layout da seção — então mora
 * aqui, e não duplicado em cada um. O ponto de corte é o mesmo do CSS e do
 * Process.tsx.
 */
export const railStretch =
  !matches('(prefers-reduced-motion: reduce)') && matches('(min-width: 900px)')
export const saveData = Boolean(navigator.connection?.saveData)
export const deviceMemory = navigator.deviceMemory ?? 4
export const cpuCores = navigator.hardwareConcurrency ?? 4

/** Vibração curta em toque. Silenciosa onde não houver suporte. */
export function buzz(ms: number): void {
  if (!isCoarsePointer || !navigator.vibrate) return
  try {
    navigator.vibrate(ms)
  } catch {
    /* alguns navegadores bloqueiam sem gesto do usuário */
  }
}

export {}
