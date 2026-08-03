import { useLanguage } from '@/lib/i18n/useLanguage'

// Fixado no carregamento: o ano não vira durante a visita, e ler o relógio
// durante o render tornaria o componente impuro.
const YEAR = new Date().getFullYear()

export function SiteFooter() {
  const { t } = useLanguage()

  return (
    <footer className="site">
      <span>Infinitum Digital</span>
      <span>{t('fplace')}</span>
      <span>© {YEAR}</span>
    </footer>
  )
}
