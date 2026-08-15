/**
 * Todo o texto do site, PT e EN.
 *
 * Alguns valores trazem <em> — é o itálico âmbar do sistema tipográfico.
 * Esses são renderizados via <Rich>, nunca interpolados com dado externo.
 *
 * REGRAS DE ESCRITA (valem para os dois idiomas, sem exceção):
 *  - Sem travessão e sem meia risca. Ponto, vírgula ou dois pontos.
 *  - Sem bullet, ponto médio ou interponto como separador. Item em linha se
 *    separa por régua de 1px no CSS, nunca por caractere.
 *  - Sem tríade retórica, sem antítese pronta.
 *  - Sem vocabulário de agência: transformar, elevar, jornada, solução
 *    completa, potencializar, entregar valor, parceiro estratégico.
 *  - Frase curta, verbo concreto. Se serve para qualquer empresa, está errada.
 *  - Nome de sócio não aparece em nenhum lugar da home. Só em /sobre.
 */
export const PT = {
  skip: 'Ir para o conteúdo',

  // θ 000° — hero
  heroEyebrow: 'Tecnologia que parece inevitável',
  heroSub:
    'A gente constrói o que a sua empresa usa todo dia e leva isso até quem precisa comprar.',
  heroCap1: 'Sites',
  heroCap2: 'Aplicativos',
  heroCap3: 'Automação',
  heroCap4: 'Tráfego pago',
  heroPlace1: 'São Paulo',
  heroPlace2: 'Atendimento global',
  heroSecondPass: 'θ 360° — segunda volta',

  navHome: 'Início',
  navAbout: 'Sobre',
  navContact: 'Contato',
  navWhatsapp: 'WhatsApp',
  navInstagram: 'Instagram',
  navEmail: 'E-mail',

  // θ 041° — sites e aplicativos
  buildLabel: 'Sites e aplicativos',
  buildH: 'Site que <em>aguenta</em> o negócio crescer.',
  buildP:
    'Interface rápida, código que a gente mesmo mantém, nada de template com o seu logo em cima.',
  buildT1: 'Institucional e landing',
  buildD1:
    'Página que carrega rápido, mede o que importa e conversa com a campanha que está no ar.',
  buildT2: 'Aplicativos web e mobile',
  buildD2:
    'React e React Native. Uma base de código, duas lojas, a mesma dupla do começo ao fim.',
  buildT3: 'Sistemas internos',
  buildD3:
    'Painel, cadastro, relatório. O que hoje mora em planilha e depende de alguém lembrar.',

  // θ 093° — automação e IA
  autoLabel: 'Automação e IA',
  autoH: 'Tarefa que <em>se repete</em> não precisa de gente repetindo.',
  autoP:
    'Mapeamos a decisão que a sua empresa toma toda semana e passamos ela para um sistema que segue a sua regra, não uma regra de prateleira.',
  autoT1: 'Integração',
  autoD1:
    'Seus sistemas conversando sem ninguém copiando dado de uma tela para outra.',
  autoT2: 'Agente com IA',
  autoD2: 'Atendimento, triagem e resposta com o histórico da sua operação por trás.',
  autoT3: 'Relatório automático',
  autoD3: 'O número certo, no horário certo, sem depender de alguém montar.',

  // θ 180° — o cruzamento
  crossLabel: 'O cruzamento',
  crossH: 'Construir e vender na <em>mesma mesa</em>.',
  crossP:
    'Agência que só anuncia depende de um site que ela não fez. Estúdio que só desenvolve entrega e some. A Infinitum fica nos dois lados da curva, e é por isso que o anúncio e a página falam a mesma língua.',

  // θ 210° — o processo (RASCUNHO: sobrelinha e título não vêm do documento
  // original, foram escritos seguindo as regras de escrita do site. Revisar
  // antes de publicar.)
  processLabel: 'Como trabalhamos',
  processH: 'Da ideia ao resultado, <em>sem intervalo</em>.',
  processStop1Title: 'Diagnóstico',
  processStop1Body:
    'A gente entende o negócio antes de propor tecnologia. O que trava hoje, o que já funciona, para onde precisa ir.',
  processStop2Title: 'Construção',
  processStop2Body:
    'Site, aplicativo ou automação. Feito sob medida, com código que a gente mesmo mantém depois.',
  processStop3Title: 'Aquisição',
  processStop3Body:
    'A campanha entra no ar sobre uma estrutura que já foi pensada para receber tráfego.',
  processStop4Title: 'Operação',
  processStop4Body:
    'Medição, ajuste e evolução. O projeto não termina na entrega, ele começa a rodar.',

  // θ 245° — tráfego pago
  reachLabel: 'Tráfego pago e aquisição',
  reachH: 'Anúncio bom não conserta <em>estrutura ruim</em>.',
  reachP:
    'Por isso a estrutura e a campanha saem da mesma dupla, com a mesma leitura de negócio.',
  reachT1: 'Meta e Google Ads',
  reachD1:
    'Campanha desenhada para o funil que existe, não para o print bonito do relatório.',
  reachT2: 'Criativo e mensagem',
  reachD2: 'O que o anúncio promete é o que a página entrega.',
  reachT3: 'Medição',
  reachD3: 'Evento, conversão e custo por venda. Métrica de vaidade fica de fora.',

  // θ 320° — contato
  ctaLabel: 'Contato',
  ctaH: 'Comece pela <em>conversa</em>.',
  ctaP:
    'Sem proposta de trinta páginas. Você conta o problema, a gente diz se resolve e quanto custa.',
  // Devolve a decisão para o visitante antes do botão. Curta, seca e
  // concreta: ecoa o "o que trava hoje" do Diagnóstico em vez de fazer uma
  // pergunta que serviria para qualquer empresa.
  ctaQuestion: 'O que está travando hoje?',
  ctaBtn: 'Falar no WhatsApp',
  ctaNote: 'Quem atende é quem faz.',
  ctaNoteLink: 'Conheça a dupla',

  // /sobre
  aboutLabel: 'Sobre',
  aboutH: 'Dois sócios, <em>nenhuma camada</em> no meio.',
  aboutP:
    'Quem constrói o produto e quem traz o cliente quase nunca sentam na mesma mesa. Aqui sentam. Você fala direto com as duas pessoas que executam, do diagnóstico à operação.',
  aboutBack: 'Voltar para o início',

  fplace1: 'São Paulo',
  fplace2: 'Remoto',
} as const

export type CopyKey = keyof typeof PT

export const EN: Record<CopyKey, string> = {
  skip: 'Skip to content',

  heroEyebrow: 'Technology that feels inevitable',
  heroSub:
    'We build what your company uses every day, and we take it to the people who need to buy it.',
  heroCap1: 'Websites',
  heroCap2: 'Apps',
  heroCap3: 'Automation',
  heroCap4: 'Paid traffic',
  heroPlace1: 'São Paulo',
  heroPlace2: 'Worldwide',
  heroSecondPass: 'θ 360° — second pass',

  navHome: 'Home',
  navAbout: 'About',
  navContact: 'Contact',
  navWhatsapp: 'WhatsApp',
  navInstagram: 'Instagram',
  navEmail: 'Email',

  buildLabel: 'Websites and apps',
  buildH: 'A website that <em>holds up</em> when the business grows.',
  buildP:
    'Fast interface, code we maintain ourselves, no template with your logo dropped on top.',
  buildT1: 'Brochure and landing',
  buildD1:
    'A page that loads fast, measures what matters and talks to the campaign that is running.',
  buildT2: 'Web and mobile apps',
  buildD2:
    'React and React Native. One codebase, two stores, the same two people start to finish.',
  buildT3: 'Internal systems',
  buildD3:
    'Dashboard, records, reports. What lives in a spreadsheet today and depends on someone remembering.',

  autoLabel: 'Automation and AI',
  autoH: 'Work that <em>repeats</em> does not need a person repeating it.',
  autoP:
    'We map the decision your company makes every week and hand it to a system that follows your rule, not a rule off the shelf.',
  autoT1: 'Integration',
  autoD1:
    'Your systems talking to each other without anyone copying data from one screen to another.',
  autoT2: 'AI agent',
  autoD2: 'Support, triage and replies with the history of your operation behind them.',
  autoT3: 'Automatic reporting',
  autoD3: 'The right number at the right time, without waiting for someone to assemble it.',

  crossLabel: 'The crossing',
  crossH: 'Building and selling at the <em>same table</em>.',
  crossP:
    'An agency that only runs ads depends on a website it did not build. A studio that only develops ships and disappears. Infinitum stays on both sides of the curve, and that is why the ad and the page speak the same language.',

  // θ 210° — the process (DRAFT: eyebrow and heading are not from the
  // original document, written to follow the site's writing rules. Review
  // before publishing.)
  processLabel: 'How we work',
  processH: 'From idea to result, <em>without a gap</em>.',
  processStop1Title: 'Diagnosis',
  processStop1Body:
    'We understand the business before proposing technology. What is stuck today, what already works, where it needs to go.',
  processStop2Title: 'Build',
  processStop2Body:
    'Website, app or automation. Built to fit, with code we maintain ourselves afterward.',
  processStop3Title: 'Acquisition',
  processStop3Body:
    'The campaign goes live on a structure that was already built to receive traffic.',
  processStop4Title: 'Operation',
  processStop4Body:
    'Measurement, adjustment and evolution. The project does not end at delivery, it starts running.',

  reachLabel: 'Paid traffic and acquisition',
  reachH: 'A good ad does not fix a <em>bad structure</em>.',
  reachP:
    'So the structure and the campaign come from the same two people, reading the business the same way.',
  reachT1: 'Meta and Google Ads',
  reachD1:
    'A campaign built for the funnel that exists, not for a good looking screenshot in the report.',
  reachT2: 'Creative and message',
  reachD2: 'What the ad promises is what the page delivers.',
  reachT3: 'Measurement',
  reachD3: 'Events, conversions and cost per sale. Vanity metrics stay out.',

  ctaLabel: 'Contact',
  ctaH: 'Start with the <em>conversation</em>.',
  ctaP:
    'No thirty page proposal. You describe the problem, we say whether we can solve it and what it costs.',
  ctaQuestion: 'What is stuck today?',
  ctaBtn: 'Talk on WhatsApp',
  ctaNote: 'You talk to the people who do the work.',
  ctaNoteLink: 'Meet the two of us',

  aboutLabel: 'About',
  aboutH: 'Two partners, <em>no layer</em> in between.',
  aboutP:
    'The person who builds the product and the person who brings the client almost never sit at the same table. Here they do. You talk straight to the two people who do the work, from diagnosis to daily operation.',
  aboutBack: 'Back to the start',

  fplace1: 'São Paulo',
  fplace2: 'Remote',
}

export const DICTIONARIES = { pt: PT, en: EN } as const
export type Language = keyof typeof DICTIONARIES

export const DOCUMENT_TITLE: Record<Language, string> = {
  pt: 'Infinitum Digital — Tecnologia sem fim',
  en: 'Infinitum Digital — Technology without end',
}

export const HTML_LANG: Record<Language, string> = {
  pt: 'pt-BR',
  en: 'en',
}
