import { Mail } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { InstagramIcon, WhatsAppIcon } from '@/components/icons/BrandIcons'
import { CONTACT_EMAIL, INSTAGRAM_HANDLE, WHATSAPP_NUMBER } from '@/content/contact'
import { thetaDegrees, useSignal } from '@/lib/field/signals'
import { useFieldState } from '@/lib/field/useFieldState'
import { useLanguage } from '@/lib/i18n/useLanguage'
import { scrollToHash } from '@/lib/scrollToHash'
import type { Language } from '@/content/copy'

const LANGUAGES: Language[] = ['pt', 'en']
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE.replace(/^@/, '')}`

export function Nav({ onGoHome }: { onGoHome: () => void }) {
  const { t, lang, setLang } = useLanguage()
  const { mode } = useFieldState()
  const degrees = useSignal(thetaDegrees)
  const location = useLocation()
  const atRest = mode === 'rest'

  /**
   * Já estando na home, clicar em CONTATO não muda a rota, então nenhum efeito
   * de navegação dispara e o App não teria como reagir. O clique resolve a
   * rolagem por conta própria e reescreve o hash com `replaceState`, para a
   * URL continuar compartilhável sem acionar o salto nativo do navegador.
   */
  const goToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname !== '/') return
    e.preventDefault()
    scrollToHash('#cta')
    window.history.replaceState(null, '', '/#cta')
  }

  /** Mesmo caso: na home, INÍCIO fecha o ciclo em vez de renavegar. */
  const goToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname !== '/') return
    e.preventDefault()
    if (location.hash) window.history.replaceState(null, '', '/')
    onGoHome()
  }

  return (
    <nav>
      <div className="brand">
        Infinitum <i>∞</i> Digital
      </div>

      <div className="navLinks">
        <Link to="/" onClick={goToTop}>
          {t('navHome')}
        </Link>
        <Link to="/sobre">{t('navAbout')}</Link>
        <Link to="/#cta" onClick={goToContact}>
          {t('navContact')}
        </Link>
      </div>

      <div className="navRight">
        <div className="navIcons">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label={t('navWhatsapp')}>
            <WhatsAppIcon size={16} />
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={t('navInstagram')}>
            <InstagramIcon size={16} />
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} aria-label={t('navEmail')}>
            <Mail size={16} />
          </a>
        </div>
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
        {/* Em /sobre o campo está parado na forma de repouso: não existe
            posição no ciclo para exibir, então o número dá lugar ao ∞.

            A régua âmbar embaixo do número é o percurso: ela preenche
            conforme θ avança, então o visitante lê que existe um caminho com
            fim, e não uma rolagem sem margem. É régua de 1px, a mesma
            linguagem dos separadores do site — não é barra nem gradiente. */}
        <button
          type="button"
          id="theta"
          onClick={onGoHome}
          style={{ '--theta-p': atRest ? 1 : degrees / 360 } as React.CSSProperties}
          aria-label="Posição no ciclo. Ative para voltar ao início."
        >
          θ {atRest ? '∞' : `${String(degrees).padStart(3, '0')}°`}
        </button>
      </div>
    </nav>
  )
}
