/**
 * Barramento mutável compartilhado entre o campo e as seções.
 *
 * É um singleton de módulo de propósito: existe exatamente um campo por
 * documento, ele nunca desmonta, e esses valores são lidos e escritos a cada
 * frame. Passá-los por estado ou contexto do React causaria re-render a 60fps
 * — que é justamente o que este arquivo evita.
 */
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
  /** Conta regressiva do anel de pulso; > 0 enquanto anima. */
  pulse: number
  /** Reforço de brilho pontual, consumido e zerado pelo loop. */
  flowBump: number
  /** Layout precisa ser remedido no próximo frame. */
  layoutDirty: boolean
}

export const fieldRuntime: FieldRuntime = {
  scrollY: 0,
  lastScrollY: 0,
  velocity: 0,
  activityAt: 0,
  pointerX: 0,
  pointerY: 0,
  pulse: 0,
  flowBump: 0,
  layoutDirty: true,
}

export function noteActivity(): void {
  fieldRuntime.activityAt = performance.now()
}

export function requestPulse(): void {
  fieldRuntime.pulse = 1
  noteActivity()
}

export function bumpFlow(amount: number): void {
  fieldRuntime.flowBump += amount
  noteActivity()
}

export function markLayoutDirty(): void {
  fieldRuntime.layoutDirty = true
}
