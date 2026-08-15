import { useSyncExternalStore } from 'react'

type Listener = () => void

export interface Signal<T> {
  get: () => T
  set: (next: T) => void
  subscribe: (listener: Listener) => () => void
}

function createSignal<T>(initial: T): Signal<T> {
  let value = initial
  const listeners = new Set<Listener>()
  return {
    get: () => value,
    set(next) {
      if (Object.is(next, value)) return
      value = next
      listeners.forEach((l) => l())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

/**
 * Saídas do loop de animação que a interface precisa ler. Só notificam quando
 * o valor realmente muda — theta muda no máximo uma vez por grau — então o
 * React re-renderiza pouco, mesmo com o loop rodando a 60fps.
 */
export const thetaDegrees = createSignal(0)

/**
 * Se o canvas WebGL está de fato desenhando. Começa falso porque o Three.js
 * carrega depois, de forma adiada (ver InfinityField.tsx). Vira falso de novo
 * se a inicialização falhar ou o contexto for perdido, e é isso que decide
 * quando o FieldFallback estático precisa aparecer — nenhuma tela pode ficar
 * sem a lemniscata, com ou sem WebGL.
 */
export const fieldLive = createSignal(false)

export function useSignal<T>(signal: Signal<T>): T {
  return useSyncExternalStore(signal.subscribe, signal.get, signal.get)
}
