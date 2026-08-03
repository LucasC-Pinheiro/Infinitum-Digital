/**
 * Todo o texto do site, PT e EN. As chaves são as mesmas do atributo
 * data-i18n do protótipo, para o mapeamento continuar auditável.
 *
 * Alguns valores trazem <em> — é o itálico âmbar do sistema tipográfico.
 * Esses são renderizados via <Rich>, nunca interpolados com dado externo.
 */
export const PT = {
  skip: 'Ir para o conteúdo',

  heroEyebrow: 'Estúdio de sistemas inevitáveis',
  heroCaps: 'IA · Software · Interfaces · Automação',
  heroPlace: 'São Paulo — atendimento global',
  heroSecondPass: 'θ 360° — segunda volta',

  navHome: 'Início',
  navAbout: 'Sobre',
  navContact: 'Contato',
  navWhatsapp: 'WhatsApp',
  navInstagram: 'Instagram',
  navEmail: 'E-mail',

  s2label: 'IA e Automação',
  s2h: 'Trabalho que continua depois que você <em>fecha o notebook</em>.',
  s2p: 'Encontramos as decisões que a sua empresa repete e entregamos essas decisões a sistemas que não esquecem, não desviam e não dormem.',
  s2k1: 'Observar',
  s2t1: 'Ele lê tudo o que você já produz',
  s2d1: 'Caixas de entrada, notas fiscais, anotações de CRM, planilhas, ligações. A matéria-prima já existe.',
  s2k2: 'Decidir',
  s2t2: 'Ele julga pelas suas regras, não por regras genéricas',
  s2d2: 'Modelos ajustados ao seu próprio histórico, com os mesmos caminhos de escalonamento que uma pessoa usaria.',
  s2k3: 'Agir',
  s2t3: 'Ele conclui a tarefa e depois presta contas',
  s2d3: 'Escreve, arquiva, encaminha, responde, atualiza. Você revisa resultados, não filas.',

  s3label: 'Sites Premium',
  s3h: 'Um site é <em>arquitetura</em>, não decoração.',
  s3f1: 'Maior renderização de conteúdo',
  s3f2: 'Quadros por segundo, no celular',
  s3f3: 'Templates utilizados',
  s3f4: 'Contraste e teclado',

  s4label: 'Sistemas Digitais',
  s4m: 'A maioria das empresas não tem um problema de software. Tem doze ferramentas que discordam entre si. Escrevemos o <em>software sob medida</em>, assentamos a <em>camada de integração</em> por baixo dele, e só chamamos o resultado de <em>transformação digital</em> quando uma única verdade atravessa a empresa inteira.',
  s4b: 'Envie um pulso pelo sistema',

  s5l: 'Todo sistema que já construímos começou como <em>um único ponto</em>.',
  s5s: 'Permaneça aqui',

  s6label: 'Quem constrói',
  s6h: 'Você fala com <em>quem constrói</em>.',
  s6hint: 'Deslize na horizontal ou use as setas',

  s7label: 'Por que a Infinitum',
  s7h: 'Um time. Um traço. <em>Sem repasses.</em>',
  s7p: 'Estratégia, marca, interface, engenharia e automação sentam na mesma sala. Nada é jogado por cima do muro, então nada chega diluído.',
  c1: 'Sistemas de marca',
  c2: 'Design de interface',
  c3: 'Engenharia front-end',
  c4: 'IA e automação',
  c5: 'Software sob medida',
  c6: 'Transformação digital',

  s8label: 'O ciclo se fecha',
  s8h: 'Comece o <em>inevitável</em>.',
  s8b: 'Iniciar uma conversa',
  s8c: 'Voltar para θ 000°',

  fplace: 'São Paulo · Remoto',
} as const

export type CopyKey = keyof typeof PT

export const EN: Record<CopyKey, string> = {
  skip: 'Skip to content',

  heroEyebrow: 'Studio for inevitable systems',
  heroCaps: 'AI · Software · Interfaces · Automation',
  heroPlace: 'São Paulo — worldwide',
  heroSecondPass: 'θ 360° — second pass',

  navHome: 'Home',
  navAbout: 'About',
  navContact: 'Contact',
  navWhatsapp: 'WhatsApp',
  navInstagram: 'Instagram',
  navEmail: 'Email',

  s2label: 'AI &amp; Automation',
  s2h: 'Work that continues after you <em>close the laptop</em>.',
  s2p: "We find the decisions your business repeats, and hand them to systems that don't forget, don't drift and don't sleep.",
  s2k1: 'Observe',
  s2t1: 'It reads everything you already produce',
  s2d1: 'Inboxes, invoices, CRM notes, spreadsheets, calls. The raw material is already there.',
  s2k2: 'Decide',
  s2t2: 'It judges by your rules, not generic ones',
  s2d2: 'Models tuned on your own history, with the escalation paths a person would take.',
  s2k3: 'Act',
  s2t3: 'It finishes the task, then reports back',
  s2d3: 'Writes, files, routes, replies, updates. You review outcomes, not queues.',

  s3label: 'Premium Websites',
  s3h: 'A website is <em>architecture</em>, not decoration.',
  s3f1: 'Largest contentful paint',
  s3f2: 'Frames per second, mobile',
  s3f3: 'Templates used',
  s3f4: 'Contrast &amp; keyboard',

  s4label: 'Digital Systems',
  s4m: "Most companies don't have a software problem. They have twelve tools that disagree. We write the <em>custom software</em>, lay the <em>integration layer</em> underneath it, and call the result <em>business transformation</em> only after one truth moves through the whole company.",
  s4b: 'Send a pulse through the system',

  s5l: 'Every system we have ever built began as <em>one single point</em>.',
  s5s: 'Hold here',

  s6label: 'Who builds it',
  s6h: 'You talk to <em>whoever builds it</em>.',
  s6hint: 'Swipe horizontally or use the arrow keys',

  s7label: 'Why Infinitum',
  s7h: 'One team. One stroke. <em>No handoffs.</em>',
  s7p: 'Strategy, brand, interface, engineering and automation sit in the same room. Nothing is thrown over a wall, so nothing arrives diluted.',
  c1: 'Brand systems',
  c2: 'Interface design',
  c3: 'Front-end engineering',
  c4: 'AI &amp; automation',
  c5: 'Custom software',
  c6: 'Business transformation',

  s8label: 'The loop closes',
  s8h: 'Begin the <em>inevitable</em>.',
  s8b: 'Start a conversation',
  s8c: 'Return to θ 000°',

  fplace: 'São Paulo · Remote',
}

export const DICTIONARIES = { pt: PT, en: EN } as const
export type Language = keyof typeof DICTIONARIES

export const DOCUMENT_TITLE: Record<Language, string> = {
  pt: 'Infinitum Digital — Tecnologia que parece inevitável',
  en: 'Infinitum Digital — Technology that feels inevitable',
}

export const HTML_LANG: Record<Language, string> = {
  pt: 'pt-BR',
  en: 'en',
}
