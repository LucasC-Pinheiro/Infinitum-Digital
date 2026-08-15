import { jitter, lemniscate } from './math'

/**
 * Formações do campo. Os índices 0 a 8 são o ciclo percorrido pelo scroll da
 * home; o 9 é a forma de repouso, usada pela rota /sobre, onde não existe
 * posição de scroll para interpolar.
 *
 * O índice 5 (trilho) foi inserido entre o cruzamento e o tráfego pago para a
 * seção horizontal (ver Process.tsx): a lemniscata se estica numa linha reta,
 * que é o trilho do scroll horizontal, e volta a se enrolar na saída.
 */
export const STATE_COUNT = 10

/** Forma em repouso: lemniscata inteira, sem morph. Alvo fixo em /sobre. */
export const REST_STATE = 9

/**
 * Grau exibido pelo contador θ do nav, por estado.
 *
 * A tabela existe porque os ângulos não são igualmente espaçados: eles vêm da
 * leitura da lemniscata (alça de construção, cruzamento, alça de aquisição) e
 * são os mesmos impressos na sobrelinha de cada seção. Antes o contador era
 * `estado / (total - 1) * 360`, o que fazia o nav mostrar 270° debaixo de uma
 * seção rotulada 245°.
 */
export const THETA = [0, 0, 41, 93, 180, 210, 245, 320, 360, 360]

/**
 * Índice do estado "trilho". Exportado porque o loop precisa reconhecê-lo para
 * achatar a rotação do grupo: uma linha reta girada nos eixos y/x é lida como
 * diagonal na tela, e o trilho tem que ler como horizontal.
 */
export const TRACK_STATE = 5

/**
 * Distância da câmera por estado.
 *
 * O hero (1) é o mais recuado do percurso, e não por gosto: o texto dele ocupa
 * quase 60% da altura da tela, então a lemniscata só cabe na faixa livre de
 * cima se for pequena. Recuar é o que a contém sem precisar que a repulsão
 * desmonte a forma para abrir espaço.
 */
export const CAMERA_Z = [30, 40, 26, 20, 11, 27, 24, 23, 20, 26]
/** Intensidade da faixa de luz que percorre o traço, por estado. */
export const FLOW = [0, 0.22, 0.3, 0.62, 0.15, 0.18, 0.75, 0.85, 0.4, 0.35]

/**
 * Deslocamento horizontal do grupo, em unidades de cena.
 *
 * Nas seções de trabalho o texto ocupa uma coluna à esquerda, então a
 * lemniscata se muda para a folga da direita. Sem isso ela nasce centrada
 * debaixo do texto e a repulsão precisa desmontá-la inteira só para abrir
 * espaço, o que a transforma num borrão. No trilho (5) o traço atravessa a
 * tela inteira, então fica centrado como as demais seções de tensão.
 */
export const OFFSET_X = [0, 0, 7, 7, 0, 0, 7, 0, 0, 0]

/**
 * Deslocamento vertical do grupo, como fração da meia-altura visível.
 *
 * Só o hero usa. O hero ancora o texto na base da tela (`justify-content:
 * flex-end`), então a lemniscata sobe para a metade de cima: o cruzamento dela
 * deixa de cair exatamente sobre a manchete e a repulsão passa a ter um
 * trabalho possível, em vez de precisar desmontar a forma inteira para abrir
 * espaço. Diferente de OFFSET_X, vale em qualquer largura — no celular a
 * manchete ocupa ainda mais da tela, então a folga de cima importa mais.
 *
 * É fração, e não unidade de cena, porque a distância da câmera do hero muda
 * com a proporção da tela (ver HERO_RADIUS). Em unidade fixa, a forma
 * assentaria em alturas diferentes conforme o viewport; em fração ela cai
 * sempre no mesmo ponto da composição.
 */
export const OFFSET_Y_FRAC = [0, 0.62, 0, 0, 0, 0, 0, 0, 0, 0]

/**
 * Meia-largura da lemniscata do hero, em unidades de cena — é o `a` com que a
 * formação 1 é gerada.
 *
 * Serve para recuar a câmera até a forma caber na largura da tela: numa tela
 * estreita e alta, uma forma larga precisa ficar menor, senão sangra pelos
 * dois lados. Só o hero faz esse ajuste. É onde a composição precisa estar
 * contida com folga, e aplicar o mesmo recuo ao percurso inteiro encolheria o
 * campo em todas as seções do celular sem necessidade.
 */
export const HERO_RADIUS = 11
/** Folga lateral exigida além da própria largura da forma. */
export const HERO_MARGIN = 1.5

/**
 * Tamanho base da partícula, por estado. O trilho (5) é o menor de todos: são
 * milhares de pontos numa linha só, e no tamanho das outras seções eles se
 * sobrepõem até virar uma barra sólida em vez de um traço.
 */
export const POINT_SIZE = [1.5, 1.5, 1.15, 1.35, 2.6, 0.42, 1.6, 1.45, 1.25, 1.4]
/**
 * Amplitude do ruído de repouso de cada partícula: é a "dispersão".
 * A alça de construção fica organizada (valor baixo), a de aquisição fica
 * solta (valor alto). O trilho (5) é o mais organizado de todos: precisa ler
 * como uma linha reta e não como um traço trêmulo.
 */
export const DRIFT = [0.09, 0.1, 0.05, 0.045, 0.08, 0.02, 0.2, 0.13, 0.1, 0.05]
/**
 * Multiplicador do relógio do shader: a alça de construção anda devagar, a de
 * aquisição anda rápido. Multiplica a velocidade de acumulação de `uTime` na
 * CPU, e não a frequência dentro do shader, porque mudar a frequência de um
 * seno com o tempo já acumulado provoca salto de fase. O trilho (5) quase
 * para: é a rolagem horizontal que dá vida à seção, não o shader.
 */
export const SPEED = [1, 1, 0.6, 0.5, 0.85, 0.25, 1.7, 1.25, 1, 0.4]

/**
 * Quanto cada formação descansa antes de virar a próxima não mora mais numa
 * tabela: é a distância entre as costuras das seções, medida em pixels de
 * scroll (ver `buildSteps` em field/layout.ts). Uma seção alta segura a
 * formação por mais tempo simplesmente por ser alta — o cruzamento e o trilho
 * do processo, que precisavam de HOLD 0,68 e 0,88 escritos à mão, hoje
 * ganham o mesmo repouso pela própria altura, sem número mágico.
 */

const TAU = 6.2831

/**
 * Gera as formações, na ordem em que o scroll as percorre:
 *
 *  0 nuvem esférica   antes do primeiro scroll
 *  1 ∞ solto          hero, θ 000°
 *  2 colunas          sites e aplicativos, θ 041°, alça de construção
 *  3 ∞ firme          automação e IA, θ 093°, alça de construção
 *  4 convergência     o cruzamento, θ 180°, as duas alças puxadas ao centro
 *  5 trilho           o processo, θ 210°, a lemniscata esticada numa linha reta
 *  6 âncoras soltas   tráfego pago, θ 245°, alça de aquisição
 *  7 ∞ em onda        contato, θ 320°
 *  8 ∞ aberto         θ 360°, a curva volta ao início
 *  9 ∞ em repouso     /sobre, sem morph
 */
export function buildStates(count: number, stretchRail = true): Float32Array[] {
  const make = (fill: (a: Float32Array) => void): Float32Array => {
    const a = new Float32Array(count * 3)
    fill(a)
    return a
  }

  return [
    make((a) => {
      for (let i = 0; i < count; i++) {
        const r = 8 + Math.random() * 14
        const th = Math.random() * TAU
        const ph = Math.acos(2 * Math.random() - 1)
        a[i * 3] = r * Math.sin(ph) * Math.cos(th)
        a[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6
        a[i * 3 + 2] = r * Math.cos(ph)
      }
    }),

    make((a) => {
      for (let i = 0; i < count; i++) {
        const p = lemniscate((i / count) * TAU, 11)
        a[i * 3] = p[0] + jitter(0.42)
        a[i * 3 + 1] = p[1] + jitter(0.42)
        a[i * 3 + 2] = jitter(1.1)
      }
    }),

    make((a) => {
      const cols = 44
      const levels = Math.max(6, Math.floor(count / cols))
      for (let i = 0; i < count; i++) {
        const ci = i % cols
        const li = Math.floor(i / cols) % levels
        const p = lemniscate((ci / cols) * TAU, 11)
        a[i * 3] = Math.round(p[0] * 1.1) + jitter(0.05)
        a[i * 3 + 1] = -6.5 + li * (13 / levels) + jitter(0.05)
        a[i * 3 + 2] = Math.round(p[1] * 2.2) + jitter(0.05)
      }
    }),

    make((a) => {
      for (let i = 0; i < count; i++) {
        const p = lemniscate((i / count) * TAU, 10.5)
        a[i * 3] = p[0] + jitter(0.1)
        a[i * 3 + 1] = p[1] + jitter(0.1)
        a[i * 3 + 2] = jitter(0.22)
      }
    }),

    // O cruzamento. Mesma lemniscata, encolhida para perto da origem, que é
    // exatamente o ponto onde as duas alças se cruzam. Chegar aqui é ver as
    // duas metades convergirem; sair daqui é vê-las se separarem de novo.
    make((a) => {
      for (let i = 0; i < count; i++) {
        const p = lemniscate((i / count) * TAU, 11 * 0.25)
        a[i * 3] = p[0] + jitter(0.16)
        a[i * 3 + 1] = p[1] + jitter(0.16)
        a[i * 3 + 2] = jitter(0.5)
      }
    }),

    // O trilho. As duas alças se abriram e o traço virou uma linha reta única,
    // que atravessa a tela: é sobre ela que a seção de processo rola na
    // horizontal (ver Process.tsx). Jitter mínimo de propósito — precisa ler
    // como régua, não como rabisco.
    //
    // O alcance em x é maior que a largura visível na distância de câmera do
    // estado: a linha tem que sangrar para fora dos dois lados, senão ela
    // aparece com duas pontas cortadas no meio da tela em vez de atravessar.
    // Espalhar mais também dilui a densidade, que é o que impedia o traço de
    // virar uma barra sólida.
    //
    // Só estica onde existe trilho horizontal. Em tela estreita a seção de
    // processo desce em lista vertical, e uma reta horizontal atrás de uma
    // lista vertical contradiz o próprio conceito: ali a lemniscata continua
    // sendo lemniscata, e o estiramento fica sendo o que ele é, a assinatura
    // do modo trilho.
    make((a) => {
      if (!stretchRail) {
        for (let i = 0; i < count; i++) {
          const t = (i / count) * TAU
          const p = lemniscate(t, 11.5)
          a[i * 3] = p[0] + jitter(0.12)
          a[i * 3 + 1] = p[1] + jitter(0.12)
          a[i * 3 + 2] = Math.sin(t) * 0.5 + jitter(0.12)
        }
        return
      }
      const half = 26
      for (let i = 0; i < count; i++) {
        const t = i / count
        a[i * 3] = (t * 2 - 1) * half + jitter(0.06)
        a[i * 3 + 1] = jitter(0.05)
        a[i * 3 + 2] = jitter(0.12)
      }
    }),

    make((a) => {
      const anchorCount = 34
      const anchors: [number, number, number][] = []
      for (let k = 0; k < anchorCount; k++) {
        const t = (k / anchorCount) * TAU
        const p = lemniscate(t, 12)
        anchors.push([p[0], p[1], Math.sin(t * 3) * 1.6])
      }
      for (let i = 0; i < count; i++) {
        const n = anchors[i % anchorCount]
        a[i * 3] = n[0] + jitter(0.72)
        a[i * 3 + 1] = n[1] + jitter(0.72)
        a[i * 3 + 2] = n[2] + jitter(0.72)
      }
    }),

    make((a) => {
      for (let i = 0; i < count; i++) {
        const t = (i / count) * TAU
        const p = lemniscate(t, 13.6)
        a[i * 3] = p[0] + jitter(0.22)
        a[i * 3 + 1] = p[1] + jitter(0.22)
        a[i * 3 + 2] = Math.sin(t * 2) * 1.2 + jitter(0.22)
      }
    }),

    make((a) => {
      for (let i = 0; i < count; i++) {
        const p = lemniscate((i / count) * TAU, 12.4)
        a[i * 3] = p[0] + jitter(0.035)
        a[i * 3 + 1] = p[1] + jitter(0.035)
        a[i * 3 + 2] = jitter(0.06)
      }
    }),

    make((a) => {
      for (let i = 0; i < count; i++) {
        const t = (i / count) * TAU
        const p = lemniscate(t, 12.4)
        a[i * 3] = p[0] + jitter(0.14)
        a[i * 3 + 1] = p[1] + jitter(0.14)
        a[i * 3 + 2] = Math.sin(t) * 0.6 + jitter(0.14)
      }
    }),
  ]
}
