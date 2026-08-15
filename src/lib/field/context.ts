import { createContext } from 'react'
import type { FieldMode } from './runtime'

export interface FieldState {
  mode: FieldMode
  setMode: (mode: FieldMode) => void
}

export const FieldStateContext = createContext<FieldState>({
  mode: 'scroll',
  setMode: () => {},
})
