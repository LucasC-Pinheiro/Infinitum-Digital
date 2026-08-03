import { jitter, lemniscate } from './math'

/** Quantidade de estados do campo. O scroll interpola linearmente entre eles. */
export const STATE_COUNT = 9

/** Distância da câmera por estado. */
export const CAMERA_Z = [30, 25, 20, 26, 24, 9, 27, 20, 23]
/** Intensidade da faixa de luz que percorre o traço, por estado. */
export const FLOW = [0, 0.22, 1, 0.1, 0.55, 0.05, 0.75, 0.3, 0.85]
/** Tamanho base da partícula, por estado. */
export const POINT_SIZE = [1.5, 1.5, 1.35, 1.15, 1.6, 3.2, 1.35, 1.25, 1.7]

const TAU = 6.2831

/**
 * Gera as nove formações de partículas, na ordem em que o scroll as percorre:
 *
 *  0 nuvem esférica  — antes do primeiro scroll
 *  1 ∞ solto         — hero
 *  2 ∞ firme         — IA e automação
 *  3 colunas         — sites premium
 *  4 âncoras         — sistemas digitais
 *  5 ponto único     — a pausa (#collapse)
 *  6 faixa lateral   — Sobre (acompanha o trilho horizontal)
 *  7 ∞ mínimo        — por que a Infinitum
 *  8 ∞ em onda       — CTA, o ciclo se fecha
 */
export function buildStates(count: number): Float32Array[] {
  const make = (fill: (a: Float32Array) => void): Float32Array => {
    const a = new Float32Array(count * 3)
    fill(a)
    return a
  }

  return [
    make((a) => {
      for (let i = 0; i < count; i++) {
        const r = 8 + Math.random() * 14
        const th = Math.random() * TAU
        const ph = Math.acos(2 * Math.random() - 1)
        a[i * 3] = r * Math.sin(ph) * Math.cos(th)
        a[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6
        a[i * 3 + 2] = r * Math.cos(ph)
      }
    }),

    make((a) => {
      for (let i = 0; i < count; i++) {
        const p = lemniscate((i / count) * TAU, 11)
        a[i * 3] = p[0] + jitter(0.42)
        a[i * 3 + 1] = p[1] + jitter(0.42)
        a[i * 3 + 2] = jitter(1.1)
      }
    }),

    make((a) => {
      for (let i = 0; i < count; i++) {
        const p = lemniscate((i / count) * TAU, 10.5)
        a[i * 3] = p[0] + jitter(0.1)
        a[i * 3 + 1] = p[1] + jitter(0.1)
        a[i * 3 + 2] = jitter(0.22)
      }
    }),

    make((a) => {
      const cols = 44
      const levels = Math.max(6, Math.floor(count / cols))
      for (let i = 0; i < count; i++) {
        const ci = i % cols
        const li = Math.floor(i / cols) % levels
        const p = lemniscate((ci / cols) * TAU, 11)
        a[i * 3] = Math.round(p[0] * 1.1) + jitter(0.05)
        a[i * 3 + 1] = -6.5 + li * (13 / levels) + jitter(0.05)
        a[i * 3 + 2] = Math.round(p[1] * 2.2) + jitter(0.05)
      }
    }),

    make((a) => {
      const anchorCount = 34
      const anchors: [number, number, number][] = []
      for (let k = 0; k < anchorCount; k++) {
        const t = (k / anchorCount) * TAU
        const p = lemniscate(t, 11)
        anchors.push([p[0], p[1], Math.sin(t * 3) * 1.6])
      }
      for (let i = 0; i < count; i++) {
        const n = anchors[i % anchorCount]
        a[i * 3] = n[0] + jitter(0.62)
        a[i * 3 + 1] = n[1] + jitter(0.62)
        a[i * 3 + 2] = n[2] + jitter(0.62)
      }
    }),

    make((a) => {
      for (let i = 0; i < count; i++) {
        a[i * 3] = jitter(0.16)
        a[i * 3 + 1] = jitter(0.16)
        a[i * 3 + 2] = jitter(0.16)
      }
    }),

    make((a) => {
      for (let i = 0; i < count; i++) {
        const u = i / count
        const p = lemniscate(u * TAU, 11)
        a[i * 3] = (u - 0.5) * 46
        a[i * 3 + 1] = p[1] * 1.5 + jitter(0.3)
        a[i * 3 + 2] = p[0] * 0.1 + jitter(0.3)
      }
    }),

    make((a) => {
      for (let i = 0; i < count; i++) {
        const p = lemniscate((i / count) * TAU, 12.4)
        a[i * 3] = p[0] + jitter(0.035)
        a[i * 3 + 1] = p[1] + jitter(0.035)
        a[i * 3 + 2] = jitter(0.06)
      }
    }),

    make((a) => {
      for (let i = 0; i < count; i++) {
        const t = (i / count) * TAU
        const p = lemniscate(t, 13.6)
        a[i * 3] = p[0] + jitter(0.22)
        a[i * 3 + 1] = p[1] + jitter(0.22)
        a[i * 3 + 2] = Math.sin(t * 2) * 1.2 + jitter(0.22)
      }
    }),
  ]
}
