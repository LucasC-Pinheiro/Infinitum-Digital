import { railStretch } from '@/lib/env'
import { clamp, smootherstep } from './math'
import { REST_STATE, STATE_COUNT } from './states'

export interface SectionLayout {
  /** Índice do estado do campo, vindo de data-state. */
  state: number
  top: number
  height: number
}

/**
 * Uma transição entre duas formações vizinhas, em pixels absolutos de scroll.
 * O destino é sempre `from + 1`.
 */
export interface MorphStep {
  from: number
  /** Scroll em que o morph está exatamente pela metade. */
  center: number
  /** Extensão total do morph, em pixels de scroll. */
  span: number
}

/**
 * Retângulo de um bloco de texto, em coordenadas de página — `left` e
 * `width` já são estáveis (a página não rola na horizontal), mas `pageTop`
 * precisa ser recombinado com o scroll atual a cada frame para virar
 * coordenada de viewport, já que só remedimos quando `layoutDirty`.
 */
export interface TextRect {
  pageTop: number
  left: number
  width: number
  height: number
}

export interface LayoutCache {
  sections: SectionLayout[]
  /** Maior scrollY possível. Fecha o ciclo exatamente no fim do documento. */
  maxScroll: number
  /** Retângulos protegidos da repulsão, por estado do campo. */
  textRects: Record<number, TextRect[]>
  /** Linha do tempo do morph, em ordem de scroll. */
  steps: MorphStep[]
  /** Formação antes do primeiro morph. */
  firstState: number
}

const EMPTY: LayoutCache = {
  sections: [],
  maxScroll: 1,
  textRects: {},
  steps: [],
  firstState: 0,
}

/**
 * Seção raiz + seletores dos blocos que o campo precisa contornar, por estado
 * (ver states.ts para o que cada índice representa). A raiz existe porque
 * classes como `.head` se repetem em várias seções — sem escopar a busca a
 * ela, `querySelectorAll` pega o `.head` de outras seções também e estoura o
 * orçamento de retângulos antes de chegar ao seletor certo.
 *
 * Em /sobre entram também as duas fotos: partícula cortando rosto é o único
 * lugar da composição onde a sobreposição não pode acontecer.
 *
 * No estado 5 (trilho) as paradas se movem por `transform: translateX`, e esta
 * medição assume `left`/`width` estáveis entre remedições (só remede em
 * `layoutDirty`, não a cada frame — ver comentário de TextRect). Elas ficam de
 * fora por isso, e também porque não precisam: a linha corre sobre o trilho e
 * o texto fica abaixo dele, sem encontro para resolver.
 */
const TEXT_SELECTORS: Record<number, { root: string; selectors: string[] }> = {
  // A manchete do hero entra linha a linha, e não como uma caixa só: em duas
  // linhas, com a segunda em itálico, a caixa única cobre um retângulo muito
  // maior do que os glifos ocupam de fato, e o campo abriria um buraco onde
  // não há texto. Por linha, a repulsão acompanha o desenho real do título.
  1: { root: '#hero', selectors: ['#baseT text', '.label', '.heroSub'] },
  2: { root: '#build', selectors: ['.head', '.loop'] },
  3: { root: '#auto', selectors: ['.head', '.loop'] },
  4: { root: '#cross', selectors: ['#crossInner'] },
  // O processo protege coisas diferentes conforme o modo, porque são duas
  // composições diferentes no mesmo índice de estado.
  //
  // No trilho, só o cabeçalho: as paradas ficam abaixo da linha e a linha
  // corre exatamente sobre o trilho, então não há encontro a resolver — e uma
  // caixa cobrindo a faixa das paradas fazia mal, porque a reta entrava no
  // campo de influência dela e chegava à tela com uma barriga no meio.
  //
  // Em lista vertical a lemniscata volta a ser forma e passa por trás do
  // texto, exatamente como nas outras seções de trabalho: aí a lista inteira
  // entra, pelo `.processTrack`, que ali é estático e mede certo.
  5: railStretch
    ? { root: '#process', selectors: ['.head'] }
    : { root: '#process', selectors: ['.head', '.processTrack'] },
  6: { root: '#reach', selectors: ['.head', '.loop'] },
  // No contato o texto e a lemniscata são os dois centrados, e o cruzamento da
  // curva cai bem no meio do bloco: não existe composição que os afaste.
  //
  // Aqui a caixa é única de propósito, ao contrário da manchete do hero. Com
  // uma entrada por linha, cada partícula do miolo cai sob a influência de
  // quatro ou cinco retângulos ao mesmo tempo, e a soma dos empurrões desmonta
  // a forma num borrão — testado, é visivelmente pior. Com uma caixa só, o
  // campo abre um vazio limpo no meio e a lemniscata vira um anel em volta do
  // texto, que é a leitura que a seção quer.
  7: { root: '#cta', selectors: ['.ctaBlock', '.label'] },
  [REST_STATE]: {
    root: '#about',
    selectors: ['.head', '.founderPhoto', '.founderText'],
  },
}

/** Teto de retângulos ativos por estado — mantém o array de uniforms pequeno. */
const MAX_TEXT_RECTS = 8

function readTextRects(): Record<number, TextRect[]> {
  const scrollY = window.scrollY
  const out: Record<number, TextRect[]> = {}
  for (const key of Object.keys(TEXT_SELECTORS)) {
    const state = Number(key)
    const { root, selectors } = TEXT_SELECTORS[state]
    const rootEl = document.querySelector<HTMLElement>(root)
    const rects: TextRect[] = []
    if (rootEl) {
      for (const selector of selectors) {
        const nodes = rootEl.querySelectorAll<HTMLElement>(selector)
        for (const el of nodes) {
          if (rects.length >= MAX_TEXT_RECTS) break
          const r = el.getBoundingClientRect()
          if (r.width < 1 || r.height < 1) continue
          rects.push({ pageTop: r.top + scrollY, left: r.left, width: r.width, height: r.height })
        }
      }
    }
    out[state] = rects
  }
  return out
}

/**
 * Mede tudo de uma vez e guarda. O loop nunca lê geometria do DOM direto —
 * só este ponto lê, e apenas quando marcado como sujo, para não forçar reflow
 * a cada frame.
 */
export function readLayout(viewportHeight: number): LayoutCache {
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>('section[data-state]'),
  )
  if (nodes.length === 0) return { ...EMPTY, textRects: readTextRects() }

  const sections = nodes.map((el) => ({
    state: Number(el.dataset.state),
    top: el.offsetTop,
    height: el.offsetHeight || 1,
  }))
  const maxScroll = Math.max(
    1,
    document.documentElement.scrollHeight - viewportHeight,
  )

  return {
    sections,
    maxScroll,
    textRects: readTextRects(),
    steps: buildSteps(sections, maxScroll, viewportHeight),
    firstState: sections[0].state,
  }
}

/**
 * Extensão de um morph, em pixels de scroll. É a mesma para todas as
 * transições de propósito.
 *
 * Antes o morph era uma fração da altura da seção, e as seções deste site têm
 * alturas muito diferentes (o hero tem 100svh, o cruzamento 190svh, o processo
 * 100svh mais o trilho inteiro). A mesma transição conceitual durava três
 * vezes mais numa seção do que na outra, e o ritmo do percurso lia como
 * arbitrário. Em pixels, toda troca de formação custa o mesmo gesto de
 * rolagem, e o que varia é só quanto tempo cada formação descansa entre uma
 * troca e outra — que é o que deveria variar.
 */
const MORPH_SPAN_VH = 0.62
const MORPH_SPAN_MIN = 380
const MORPH_SPAN_MAX = 880
/** Extensão do fecho do ciclo, como fração da extensão normal. */
const TAIL_SPAN_RATIO = 0.55

/**
 * Monta a linha do tempo: um morph centrado na costura entre cada par de
 * seções vizinhas, mais o fechamento do ciclo no fim do documento.
 *
 * Centrar na costura (`next.top`) é o que dá ao hero um trecho real de
 * descanso. Pelo modelo antigo, a fração da seção era medida pelo meio da
 * viewport, então no topo da página o hero já nascia com fração 0,5 — passado
 * o ponto em que a transição começava. O visitante nunca via a lemniscata do
 * hero parada: ela já estava saindo antes do primeiro gesto de rolagem.
 */
function buildSteps(
  sections: SectionLayout[],
  maxScroll: number,
  viewportHeight: number,
): MorphStep[] {
  const span = clamp(
    viewportHeight * MORPH_SPAN_VH,
    MORPH_SPAN_MIN,
    MORPH_SPAN_MAX,
  )
  const steps: MorphStep[] = []

  /** Folga mínima entre o fim de um morph e o começo do próximo. */
  const gap = (a: MorphStep, b: MorphStep) => (a.span + b.span) * 0.5

  const push = (from: number, center: number, stepSpan = span) => {
    const previous = steps[steps.length - 1]
    const next = { from, center, span: stepSpan }
    // Dois morphs nunca se sobrepõem: numa seção mais curta que o próprio
    // morph, a segunda transição espera a primeira fechar em vez de as duas
    // correrem juntas e a formação do meio ser pulada.
    if (previous) {
      next.center = Math.max(center, previous.center + gap(previous, next))
    }
    steps.push(next)
  }

  for (let i = 0; i < sections.length - 1; i++) {
    // Só encadeia formações vizinhas. Um salto na ordem dos `data-state`
    // significaria que a página montou algo fora do ciclo, e interpolar entre
    // formações não vizinhas atravessaria estados que ninguém pediu.
    if (sections[i + 1].state !== sections[i].state + 1) continue
    push(sections[i].state, sections[i + 1].top)
  }

  // Fechamento. A última seção tem o rodapé abaixo dela, então nenhuma costura
  // com uma próxima existe: o último morph é amarrado ao fim do documento, e
  // chegar ao fim da página é exatamente fechar a volta em θ 360°.
  //
  // O fecho é mais curto que os outros morphs de propósito: θ 320° e θ 360°
  // são as duas lemniscatas inteiras, uma em onda e a outra aberta, e passar
  // de uma para a outra é um assentamento, não uma troca de formação. Gastar a
  // extensão inteira nele roubava da seção de tráfego pago o único trecho em
  // que ela poderia mostrar a própria forma parada.
  const last = sections[sections.length - 1]
  if (last.state + 1 <= STATE_COUNT - 2) {
    const tail = span * TAIL_SPAN_RATIO
    push(last.state, maxScroll - tail * 0.5, tail)
  }

  // Passada de trás para frente: nada pode ser agendado para depois do fim do
  // documento.
  //
  // A costura do contato cai a oito centésimos de tela do fim da página — o
  // bloco é a última coisa antes do rodapé —, então os dois últimos morphs
  // não cabiam no que sobrava e o percurso terminava em θ 299° com o ciclo
  // aberto. Puxando os centros para trás a partir do fim, o último morph
  // fecha exatamente no fim do documento e os anteriores abrem espaço para
  // ele, cada um mantendo a sua extensão inteira.
  let limit = maxScroll - steps[steps.length - 1].span * 0.5
  for (let i = steps.length - 1; i >= 0; i--) {
    if (steps[i].center > limit) steps[i].center = limit
    limit = steps[i].center - (i > 0 ? gap(steps[i - 1], steps[i]) : 0)
  }

  return steps
}

/**
 * Converte scroll absoluto em posição contínua no ciclo, percorrendo a linha
 * do tempo montada por `buildSteps`. Fora de um morph a formação fica parada;
 * dentro de um, avança por `smootherstep`.
 */
export function computeTarget(scrollY: number, layout: LayoutCache): number {
  const { steps } = layout
  if (steps.length === 0) return layout.firstState

  let target = steps[0].from
  for (const step of steps) {
    const p = (scrollY - (step.center - step.span * 0.5)) / step.span
    if (p <= 0) break // ainda antes deste morph: a formação anterior segura
    target = step.from + (p >= 1 ? 1 : smootherstep(p))
    if (p < 1) break // dentro deste morph
  }
  return clamp(target, 0, STATE_COUNT - 1)
}
