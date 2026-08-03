import { createContext } from 'react'
import type { CopyKey, Language } from '@/content/copy'

export interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  /** Texto da chave no idioma atual. Pode conter <em>; ver <Rich>. */
  t: (key: CopyKey) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)
