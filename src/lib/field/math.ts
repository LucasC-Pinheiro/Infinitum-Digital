/** Lemniscata de Bernoulli — a forma de ∞ que gera todo o sistema visual. */
export function lemniscate(t: number, a: number): [number, number] {
  const s = Math.sin(t)
  const c = Math.cos(t)
  const d = 1 + s * s
  return [(a * c) / d, (a * s * c) / d]
}

/** Ruído simétrico em torno de zero, amplitude `s`. */
export function jitter(s: number): number {
  return (Math.random() * 2 - 1) * s
}

export function easeInOut(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

/**
 * Interpolação exponencial independente de framerate. Equivale ao
 * `v += (alvo - v) * (1 - Math.pow(base, dt))` repetido no protótipo:
 * `base` é a fração da distância que sobra após 1 segundo.
 */
export function damp(current: number, target: number, base: number, dt: number): number {
  return current + (target - current) * (1 - Math.pow(base, dt))
}
