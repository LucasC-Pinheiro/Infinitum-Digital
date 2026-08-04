import type { Language } from './copy'

// Fotos importadas como módulo ES para o Vite versionar e otimizar os
// arquivos. Os nomes seguem exatamente o que está em disco — o build da
// Vercel roda em Linux, onde maiúscula e minúscula são diferentes.
import lucasPhoto from '@/assets/team/Lucas.png'
import enzoPhoto from '@/assets/team/Enzo.png'

export interface Founder {
  id: string
  /** Nome em serifa, o maior tipo da seção. */
  name: string
  /** Função, uma linha, em itálico. */
  role: string
  /** Uma frase de abordagem. Não é bio — é o que a pessoa se compromete a fazer. */
  line: string
  photo: string
  photoAlt: string
}

export const FOUNDERS: Record<Language, Founder[]> = {
  pt: [
    {
      id: 'lucas',
      name: 'Lucas Pinheiro',
      role: 'Desenvolvedor full stack e mobile.',
      line: 'Construo o que sustenta o negócio: sites, apps, automações, sistemas com IA.',
      photo: lucasPhoto,
      photoAlt: 'Lucas Pinheiro, cofundador da Infinitum Digital',
    },
    {
      id: 'enzo',
      name: 'Enzo Oliveira',
      role: 'Tráfego pago.',
      line: 'Levo o que o Lucas constrói até quem precisa comprar.',
      photo: enzoPhoto,
      photoAlt: 'Enzo Oliveira, cofundador da Infinitum Digital',
    },
  ],
  en: [
    {
      id: 'lucas',
      name: 'Lucas Pinheiro',
      role: 'Full stack and mobile developer.',
      line: 'I build what holds the business up: websites, apps, automation, AI systems.',
      photo: lucasPhoto,
      photoAlt: 'Lucas Pinheiro, co-founder of Infinitum Digital',
    },
    {
      id: 'enzo',
      name: 'Enzo Oliveira',
      role: 'Paid traffic.',
      line: 'I take what Lucas builds to the people who need to buy it.',
      photo: enzoPhoto,
      photoAlt: 'Enzo Oliveira, co-founder of Infinitum Digital',
    },
  ],
}
