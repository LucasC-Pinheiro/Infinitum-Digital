import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { InstagramIcon, WhatsAppIcon } from '@/components/icons/BrandIcons'
import { CONTACT_EMAIL, INSTAGRAM_HANDLE, WHATSAPP_NUMBER } from '@/content/contact'
import { useLanguage } from '@/lib/i18n/useLanguage'

// Fixado no carregamento: o ano não vira durante a visita, e ler o relógio
// durante o render tornaria o componente impuro.
const YEAR = new Date().getFullYear()
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE.replace(/^@/, '')}`

export function SiteFooter() {
  const { t } = useLanguage()

  return (
    <footer className="site">
      <span>Infinitum Digital</span>
      <ul className="ruled">
        <li>{t('fplace1')}</li>
        <li>{t('fplace2')}</li>
      </ul>

      {/* Só visível abaixo do breakpoint em que a nav esconde âncoras e
          ícones (ver .navLinks/.navIcons em index.css) — em telas largas
          esse mesmo conteúdo já está na nav. */}
      <div className="footContact">
        <Link to="/">{t('navHome')}</Link>
        <Link to="/sobre">{t('navAbout')}</Link>
        <Link to="/#cta">{t('navContact')}</Link>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label={t('navWhatsapp')}>
          <WhatsAppIcon size={15} />
        </a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={t('navInstagram')}>
          <InstagramIcon size={15} />
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} aria-label={t('navEmail')}>
          <Mail size={15} />
        </a>
      </div>

      <span>© {YEAR}</span>
    </footer>
  )
}
