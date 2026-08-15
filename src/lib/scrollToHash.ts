import { prefersReducedMotion } from '@/lib/env'

/**
 * Rolagem programática até uma âncora.
 *
 * A âncora nativa do navegador não serve aqui, e não por preferência: o
 * destino real de `#cta` depende de alturas que só existem depois que o
 * JavaScript mede a página. A seção de processo cresce conforme a sobra
 * horizontal do trilho (`--rail-travel`, ver Process.tsx), e as fontes serif
 * mudam a altura de todas as manchetes ao trocar do fallback para a fonte
 * real. Nos dois casos o salto nativo acontece cedo demais, com o layout
 * ainda em outra medida, e para no lugar errado — ou, quando o React Router
 * intercepta a navegação, não acontece nunca.
 *
 * Por isso a posição é sempre recalculada a partir do retângulo atual do
 * elemento, e reconferida algumas vezes depois do salto: se o layout assentar
 * numa altura diferente, a diferença é corrigida sem novo gesto do usuário.
 */

/** Altura da barra fixa, lida do CSS para o número não viver em dois lugares. */
function navOffset(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : 72
}

/** Quanto o destino pode estar fora do lugar antes de valer uma correção. */
const SETTLE_TOLERANCE = 4
const SETTLE_STEPS = 4
const SETTLE_INTERVAL = 220

export interface ScrollToHashOptions {
  /** Rolagem suave. Desligada no acesso direto, onde o salto deve ser seco. */
  smooth?: boolean
}

/**
 * Rola até o elemento do hash. Devolve `false` se o alvo não existir na
 * página — o chamador decide o que fazer (normalmente, deixar como está).
 */
export function scrollToHash(
  hash: string,
  { smooth = true }: ScrollToHashOptions = {},
): boolean {
  const id = hash.replace(/^#/, '')
  if (!id) return false
  if (!document.getElementById(id)) return false

  const jump = (behavior: ScrollBehavior) => {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - navOffset()
    window.scrollTo({ top: Math.max(0, top), behavior })
  }

  const animated = smooth && !prefersReducedMotion
  jump(animated ? 'smooth' : 'auto')

  // Reconferência. Começa depois de a rolagem suave ter tido tempo de
  // terminar, para não brigar com ela, e corrige em salto seco.
  let step = 0
  const recheck = () => {
    const el = document.getElementById(id)
    if (!el) return
    if (Math.abs(el.getBoundingClientRect().top - navOffset()) > SETTLE_TOLERANCE) {
      jump('auto')
    }
    if (++step < SETTLE_STEPS) window.setTimeout(recheck, SETTLE_INTERVAL)
  }
  window.setTimeout(recheck, animated ? 700 : 140)

  return true
}

/**
 * Acesso direto com o hash já na URL, em recarga completa. Espera as fontes
 * antes da primeira tentativa e insiste enquanto o alvo ainda não existir —
 * a home é montada pelo React, então o elemento não está lá no primeiro
 * frame.
 */
export function scrollToHashOnLoad(hash: string): void {
  if (!hash) return
  let tries = 0
  const attempt = () => {
    if (scrollToHash(hash, { smooth: false })) return
    if (++tries > 24) return
    window.setTimeout(attempt, 80)
  }
  const fonts = document.fonts?.ready ?? Promise.resolve()
  void fonts.then(() => requestAnimationFrame(attempt))
  // Não espera só pelas fontes: se elas demorarem, a primeira tentativa sai
  // assim que a árvore existir e a reconferência corrige depois.
  requestAnimationFrame(attempt)
}
