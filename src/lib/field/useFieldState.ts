import { use } from 'react'
import { FieldStateContext } from './context'

export function useFieldState() {
  return use(FieldStateContext)
}
