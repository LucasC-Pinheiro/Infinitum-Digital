import { Mail } from 'lucide-react'
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
      <span>{t('fplace')}</span>

      {/* Só visível abaixo do breakpoint em que a nav esconde âncoras e
          ícones (ver .navLinks/.navIcons em index.css) — em telas largas
          esse mesmo conteúdo já está na nav. */}
      <div className="footContact">
        <a href="#hero">{t('navHome')}</a>
        <a href="#about">{t('navAbout')}</a>
        <a href="#cta">{t('navContact')}</a>
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
