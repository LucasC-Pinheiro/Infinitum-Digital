import { thetaDegrees, useSignal } from '@/lib/field/signals'
import { useLanguage } from '@/lib/i18n/useLanguage'
import type { Language } from '@/content/copy'

const LANGUAGES: Language[] = ['pt', 'en']

export function Nav({ onGoHome }: { onGoHome: () => void }) {
  const { lang, setLang } = useLanguage()
  const degrees = useSignal(thetaDegrees)

  return (
    <nav>
      <div className="brand">
        Infinitum <i>∞</i> Digital
      </div>
      <div className="navRight">
        <div id="lang">
          {LANGUAGES.map((code, i) => (
            <span key={code} style={{ display: 'contents' }}>
              {i > 0 && <span>/</span>}
              <button
                type="button"
                className={code === lang ? 'on' : undefined}
                onClick={() => setLang(code)}
                aria-pressed={code === lang}
              >
                {code.toUpperCase()}
              </button>
            </span>
          ))}
        </div>
        <button
          type="button"
          id="theta"
          onClick={onGoHome}
          aria-label="Posição no ciclo. Ative para voltar ao início."
        >
          θ {String(degrees).padStart(3, '0')}°
        </button>
      </div>
    </nav>
  )
}
