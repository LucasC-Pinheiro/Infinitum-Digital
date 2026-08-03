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
 * o valor realmente muda — theta muda no máximo uma vez por grau, e `deep`
 * duas vezes por passagem — então o React re-renderiza pouco, mesmo com o
 * loop rodando a 60fps.
 */
export const thetaDegrees = createSignal(0)
export const collapseDeep = createSignal(false)

export function useSignal<T>(signal: Signal<T>): T {
  return useSyncExternalStore(signal.subscribe, signal.get, signal.get)
}
