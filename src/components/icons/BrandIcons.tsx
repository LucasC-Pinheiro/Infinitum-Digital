import type { SVGProps } from 'react'

/**
 * lucide-react não inclui logos de marca (WhatsApp/Instagram) — foram
 * removidos do pacote por licenciamento. Estes dois glifos seguem o mesmo
 * traço do resto do set (viewBox 24, stroke 2, round) para não destoar do
 * ícone de e-mail, que vem do lucide-react.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function WhatsAppIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...base} width={size} height={size} {...rest}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.79.46 3.47 1.267 4.933L2 22l5.267-1.204A9.96 9.96 0 0 0 12 22Z" />
      <path d="M8.5 9.3c0-.5.3-1.1.8-1.3.3-.1.6 0 .8.3l.7 1.1c.2.3.2.6 0 .9l-.4.6c-.1.2-.1.4 0 .6.4.8 1.4 1.8 2.2 2.2.2.1.4.1.6 0l.6-.4c.3-.2.6-.2.9 0l1.1.7c.3.2.4.5.3.8-.2.5-.9.8-1.4.8-1.8 0-4.4-1.8-5.6-3.6-.4-.6-.6-1.2-.6-1.6Z" />
    </svg>
  )
}

export function InstagramIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...base} width={size} height={size} {...rest}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
