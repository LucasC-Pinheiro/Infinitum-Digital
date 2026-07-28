export interface ServicePanel {
  id: string
  tag: string
  title: string
  body: string
}

export const SERVICE_PANELS: ServicePanel[] = [
  {
    id: 'panel1',
    tag: 'sites',
    title: 'Sites que carregam confiança antes do primeiro clique.',
    body: 'Interfaces rápidas e responsivas, construídas para converter — não apenas para existir.',
  },
  {
    id: 'panel2',
    tag: 'apps',
    title: 'Aplicativos que acompanham o ritmo do seu negócio.',
    body: 'iOS, Android e web com a mesma experiência fluida em qualquer tela.',
  },
  {
    id: 'panel3',
    tag: 'automação',
    title: 'Sistemas que trabalham enquanto você dorme.',
    body: 'Fluxos automatizados que eliminam tarefas repetitivas e erros manuais.',
  },
  {
    id: 'panel4',
    tag: 'tráfego pago',
    title: 'Tráfego que não para de trazer resultado.',
    body: 'Campanhas geridas com dados, não achismo — otimização contínua.',
  },
]
