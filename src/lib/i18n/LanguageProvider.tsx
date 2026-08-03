import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  DICTIONARIES,
  DOCUMENT_TITLE,
  HTML_LANG,
  type CopyKey,
  type Language,
} from '@/content/copy'
import { LanguageContext } from './context'

/** Português para quem navega em português; inglês para todo o resto. */
function detectLanguage(): Language {
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(detectLanguage)

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang]
    document.title = DOCUMENT_TITLE[lang]
  }, [lang])

  const t = useCallback((key: CopyKey) => DICTIONARIES[lang][key], [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t])

  return <LanguageContext value={value}>{children}</LanguageContext>
}
