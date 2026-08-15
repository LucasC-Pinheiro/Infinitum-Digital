import type { Language } from './copy'

// Fotos importadas como módulo ES para o Vite versionar e otimizar os
// arquivos. Os nomes seguem exatamente o que está em disco — o build da
// Vercel roda em Linux, onde maiúscula e minúscula são diferentes.
import lucasPhoto from '@/assets/team/Lucas.png'
import enzoPhoto from '@/assets/team/Enzo.png'

export interface Founder {
  id: string
  /** Nome em serifa, o maior tipo da página. */
  name: string
  /** Função, uma linha, em itálico. */
  role: string
  /** Dois parágrafos curtos. Não é currículo. */
  bio: [string, string]
  /**
   * O que a pessoa entrega, em Plex Mono, separado por régua de 1px no CSS.
   * No bloco do Lucas são as frentes de trabalho, e não a stack: quem
   * contrata compra entrega. No do Enzo são as plataformas, porque ali o nome
   * da plataforma é a entrega.
   */
  stack: string[]
  photo: string
  photoAlt: string
  /** Marca o bloco como conteúdo por preencher. */
  todo?: boolean
}

export const FOUNDERS: Record<Language, Founder[]> = {
  pt: [
    {
      id: 'lucas',
      name: 'Lucas Pinheiro',
      role: 'Desenvolvedor full stack e mobile.',
      bio: [
        'Escreve o que roda: a interface, o servidor e o aplicativo. Prefere resolver o problema na arquitetura a remendar depois.',
        'Mantém o que entrega. O código fica com quem escreveu, então correção não vira orçamento novo.',
      ],
      // Entrega, não stack: quem contrata compra o que fica pronto. Nome de
      // biblioteca fala com recrutador, não com cliente.
      stack: ['Sites', 'Apps', 'Automação'],
      photo: lucasPhoto,
      photoAlt: 'Lucas Pinheiro, cofundador da Infinitum Digital',
    },
    {
      id: 'enzo',
      name: 'Enzo Oliveira',
      role: 'Tráfego pago e aquisição.',
      bio: [
        'Cuida do que acontece depois que o produto está no ar. Campanha, criativo, verba e leitura de resultado, com foco no número que muda o negócio e não no que enche relatório.',
        'Entra no projeto desde o diagnóstico, junto com a construção. Quando a campanha sobe, a página já foi pensada para receber o tráfego que ela traz, e isso encurta muito o caminho entre o clique e a venda.',
      ],
      stack: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'GA4'],
      photo: enzoPhoto,
      photoAlt: 'Enzo Oliveira, cofundador da Infinitum Digital',
    },
  ],
  en: [
    {
      id: 'lucas',
      name: 'Lucas Pinheiro',
      role: 'Full stack and mobile developer.',
      bio: [
        'He writes what runs: the interface, the server and the app. He would rather solve a problem in the architecture than patch it later.',
        'He maintains what he ships. The code stays with the person who wrote it, so a fix does not turn into a new quote.',
      ],
      stack: ['Websites', 'Apps', 'Automation'],
      photo: lucasPhoto,
      photoAlt: 'Lucas Pinheiro, co-founder of Infinitum Digital',
    },
    {
      id: 'enzo',
      name: 'Enzo Oliveira',
      role: 'Paid traffic and acquisition.',
      bio: [
        'He takes care of what happens after the product goes live: campaign, creative, budget and reading the results, focused on the number that changes the business, not the one that fills a report.',
        'He joins the project from the diagnosis, alongside the build. By the time the campaign goes up, the page has already been designed to receive the traffic it brings, which shortens the path from click to sale by a lot.',
      ],
      stack: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'GA4'],
      photo: enzoPhoto,
      photoAlt: 'Enzo Oliveira, co-founder of Infinitum Digital',
    },
  ],
}
