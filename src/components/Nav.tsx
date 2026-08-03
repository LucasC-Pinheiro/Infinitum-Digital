import { Mail } from 'lucide-react'
import { InstagramIcon, WhatsAppIcon } from '@/components/icons/BrandIcons'
import { CONTACT_EMAIL, INSTAGRAM_HANDLE, WHATSAPP_NUMBER } from '@/content/contact'
import { thetaDegrees, useSignal } from '@/lib/field/signals'
import { useLanguage } from '@/lib/i18n/useLanguage'
import type { Language } from '@/content/copy'

const LANGUAGES: Language[] = ['pt', 'en']
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE.replace(/^@/, '')}`

export function Nav({ onGoHome }: { onGoHome: () => void }) {
  const { t, lang, setLang } = useLanguage()
  const degrees = useSignal(thetaDegrees)

  return (
    <nav>
      <div className="brand">
        Infinitum <i>∞</i> Digital
      </div>

      <div className="navLinks">
        <a href="#hero">{t('navHome')}</a>
        <a href="#about">{t('navAbout')}</a>
        <a href="#cta">{t('navContact')}</a>
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
