import type { Language } from './copy'

// Fotos importadas como módulo ES para o Vite versionar e otimizar os
// arquivos. Os nomes seguem exatamente o que está em disco — o build da
// Vercel roda em Linux, onde maiúscula e minúscula são diferentes.
import lucasPhoto from '@/assets/team/Lucas.png'
import enzoPhoto from '@/assets/team/Enzo.png'

export interface AboutSlide {
  id: string
  /** Título grande em serifa. */
  name: string
  /** Linha itálica sob o nome. */
  role: string
  bio: string
  meta: string[]
  photo?: string
  photoAlt?: string
}

/*
 * BIOS — AGUARDANDO ESCOLHA DE LUCAS E ENZO
 *
 * A variação A está ativa abaixo. As alternativas ficam aqui; para trocar,
 * substitua o texto do campo `bio` do slide correspondente.
 *
 * LUCAS
 *  A) Escreve o que roda: sites, aplicativos e os sistemas de automação por
 *     trás deles. Se está em produção, passou pelas mãos dele.
 *  B) Cuida da parte que precisa funcionar às três da manhã. Front-end,
 *     back-end, mobile e as automações que ninguém vê.
 *  C) Constrói o produto inteiro — interface, servidor, aplicativo. Prefere
 *     resolver o problema na arquitetura a remendar depois.
 *
 * ENZO
 *  A) Leva gente até o que o Lucas constrói. Campanha, verba e a conta que
 *     precisa fechar no fim do mês.
 *  B) Cuida da aquisição: onde investir, quanto, e quando parar. Decide por
 *     dado, não por palpite.
 *  C) Trabalha o tráfego pago desde o primeiro rascunho do site — porque
 *     campanha encaixada depois custa mais caro.
 */

export const ABOUT: Record<Language, AboutSlide[]> = {
  pt: [
    {
      id: 'estudio',
      name: 'Infinitum',
      role: 'Dois sócios. Clientes em qualquer fuso.',
      bio: 'Construímos sistemas de IA e automação, software sob medida, sites e interfaces. O mesmo par de pessoas conduz o projeto do primeiro diagnóstico até a operação — não existe time de vendas que some depois da assinatura.',
      meta: ['São Paulo', 'Atendimento global', 'Dois sócios'],
    },
    {
      id: 'lucas',
      name: 'Lucas Pinheiro',
      role: 'Desenvolvedor full stack e mobile.',
      bio: 'Escreve o que roda: sites, aplicativos e os sistemas de automação por trás deles. Se está em produção, passou pelas mãos dele.',
      meta: ['Full stack', 'Mobile', 'Automação'],
      photo: lucasPhoto,
      photoAlt: 'Lucas Pinheiro, cofundador da Infinitum Digital',
    },
    {
      id: 'enzo',
      name: 'Enzo Oliveira',
      role: 'Tráfego pago e aquisição.',
      bio: 'Leva gente até o que o Lucas constrói. Campanha, verba e a conta que precisa fechar no fim do mês.',
      meta: ['Tráfego pago', 'Aquisição', 'Performance'],
      photo: enzoPhoto,
      photoAlt: 'Enzo Oliveira, cofundador da Infinitum Digital',
    },
  ],
  en: [
    {
      id: 'estudio',
      name: 'Infinitum',
      role: 'Two partners. Clients in any time zone.',
      bio: 'We build AI and automation systems, custom software, websites and interfaces. The same two people carry the project from the first diagnosis through to daily operation — there is no sales team that disappears after the contract.',
      meta: ['São Paulo', 'Worldwide', 'Two partners'],
    },
    {
      id: 'lucas',
      name: 'Lucas Pinheiro',
      // Traduções das bios: reescrever depois que a variação final for
      // escolhida em português.
      role: 'Full stack and mobile developer.',
      bio: 'He writes what runs: the websites, the apps and the automation behind them. If it is in production, it went through his hands.',
      meta: ['Full stack', 'Mobile', 'Automation'],
      photo: lucasPhoto,
      photoAlt: 'Lucas Pinheiro, co-founder of Infinitum Digital',
    },
    {
      id: 'enzo',
      name: 'Enzo Oliveira',
      role: 'Paid traffic and acquisition.',
      bio: 'He brings people to what Lucas builds. Campaigns, budget, and the number that has to add up at the end of the month.',
      meta: ['Paid traffic', 'Acquisition', 'Performance'],
      photo: enzoPhoto,
      photoAlt: 'Enzo Oliveira, co-founder of Infinitum Digital',
    },
  ],
}
