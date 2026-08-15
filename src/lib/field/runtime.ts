/**
 * Barramento mutável compartilhado entre o campo e o resto da aplicação.
 *
 * É um singleton de módulo de propósito: existe exatamente um campo por
 * documento, ele nunca desmonta, e esses valores são lidos e escritos a cada
 * frame. Passá-los por estado ou contexto do React causaria re-render a 60fps
 * — que é justamente o que este arquivo evita. Quem precisa reagir a eles no
 * React usa os sinais em field/signals.ts, que só notificam quando o valor
 * observável realmente muda.
 */

/**
 * De onde vem o estado alvo do campo.
 *
 * `scroll` é a home: o alvo sai da posição de rolagem. `rest` é /sobre, que
 * não tem ciclo para percorrer e fixa a lemniscata na forma de repouso. Quem
 * escreve aqui é o FieldStateProvider, na troca de rota.
 */
export type FieldMode = 'scroll' | 'rest'

export interface FieldRuntime {
  scrollY: number
  lastScrollY: number
  /** Velocidade de scroll acumulada; vira "energia" no shader. */
  velocity: number
  /** performance.now() da última interação, usado pelo throttle de ociosidade. */
  activityAt: number
  /** Posição do ponteiro normalizada em -0.5..0.5. */
  pointerX: number
  pointerY: number
  /** Reforço de brilho pontual, consumido e zerado pelo loop. */
  flowBump: number
  /** Layout precisa ser remedido no próximo frame. */
  layoutDirty: boolean
  mode: FieldMode
}

export const fieldRuntime: FieldRuntime = {
  scrollY: 0,
  lastScrollY: 0,
  velocity: 0,
  activityAt: 0,
  pointerX: 0,
  pointerY: 0,
  flowBump: 0,
  layoutDirty: true,
  mode: 'scroll',
}

export function noteActivity(): void {
  fieldRuntime.activityAt = performance.now()
}

export function bumpFlow(amount: number): void {
  fieldRuntime.flowBump += amount
  noteActivity()
}

export function markLayoutDirty(): void {
  fieldRuntime.layoutDirty = true
}
