import { use } from 'react'
import { LanguageContext, type LanguageContextValue } from './context'

export function useLanguage(): LanguageContextValue {
  const ctx = use(LanguageContext)
  if (!ctx) throw new Error('useLanguage precisa estar dentro de <LanguageProvider>')
  return ctx
}
