import { useEffect, useRef } from 'react'
import { isCoarsePointer, prefersReducedMotion, railStretch } from '@/lib/env'
import { clamp, damp, smootherstep } from '@/lib/field/math'
import { computeTarget, readLayout, type LayoutCache } from '@/lib/field/layout'
import { fieldRuntime, noteActivity } from '@/lib/field/runtime'
import { fieldLive, thetaDegrees } from '@/lib/field/signals'
import {
  buildStates,
  CAMERA_Z,
  DRIFT,
  FLOW,
  HERO_MARGIN,
  HERO_RADIUS,
  OFFSET_X,
  OFFSET_Y_FRAC,
  POINT_SIZE,
  REST_STATE,
  SPEED,
  STATE_COUNT,
  THETA,
  TRACK_STATE,
} from '@/lib/field/states'
import { resolveTier } from '@/lib/field/tier'

/**
 * Quantos blocos de texto o campo consegue contornar ao mesmo tempo. Subiu de
 * 6 para 8 quando a manchete do hero passou a ser protegida linha a linha (ver
 * TEXT_SELECTORS em field/layout.ts): a manchete sozinha ocupa até três slots.
 */
const TEXT_RECT_COUNT = 8

/**
 * Campo de visão da câmera, em graus, e a tangente da metade dele — que é o
 * fator que converte distância de câmera em meia-altura visível na cena.
 * Precisa ser o mesmo valor passado à PerspectiveCamera lá embaixo.
 */
const FOV = 42
const HALF_TAN_FOV = Math.tan(((FOV / 2) * Math.PI) / 180)

const TAU = Math.PI * 2

/**
 * Duração da abertura: a nuvem se condensando na lemniscata do hero.
 *
 * Ela existe porque o Three entra por `requestIdleCallback`, e o morph de
 * entrada já estava quase terminado quando o primeiro quadro aparecia na tela
 * — o visitante pegava o rabo da animação, um solavanco de uns 150ms em vez de
 * uma entrada. Agora a contagem começa quando existe o que ver.
 */
const OPENING_S = 1.9

const VERTEX_SHADER = `
attribute vec3 aPosA; attribute vec3 aPosB; attribute float aSeed; attribute float aT;
uniform float uMix,uTime,uSize,uFlow,uEnergy,uDrift;
uniform vec4 uTextRect[${TEXT_RECT_COUNT}];
varying float vGlow; varying float vSeed;

const float TEXT_PAD = 0.07;
// Empurrão máximo, em NDC.
//
// O que resolveu a manchete do hero não foi subir este número — com empurrão
// forte a lemniscata se desmontava e o resultado ficava pior do que o traço
// atravessando o texto. O que resolveu foi composição: a lemniscata do hero
// subiu e recuou (OFFSET_Y_FRAC e CAMERA_Z em field/states.ts), então a
// manchete deixou de ficar debaixo do miolo da forma.
//
// O valor segue o do protótipo aprovado. Baixá-lo "para ajudar o hero" tinha
// um custo escondido no contato, onde texto e lemniscata são os dois
// centrados e não há como afastá-los por composição: ali o empurrão é a única
// defesa que existe.
const float TEXT_PUSH = 0.68;

void main(){
  vec3 p = mix(aPosA,aPosB,uMix);
  float s = aSeed*6.2831;
  // uDrift é a dispersão da seção: alça de construção organizada, alça de
  // aquisição solta. A velocidade não entra aqui — ela já vem embutida no
  // ritmo com que a CPU acumula uTime, senão mudar a frequência de um seno
  // com o tempo já acumulado provocaria salto de fase.
  float amp = uDrift + uEnergy*0.5;
  p.x += sin(uTime*0.55 + s)*amp;
  p.y += cos(uTime*0.47 + s*1.7)*amp;
  p.z += sin(uTime*0.41 + s*2.3)*(amp*1.3);
  vec4 mv = modelViewMatrix*vec4(p,1.0);
  gl_Position = projectionMatrix*mv;

  // Repulsão de texto: em espaço de tela, empurra a partícula para fora de
  // qualquer bloco protegido da seção atual — o campo abre espaço ao redor da
  // leitura em vez de passar por cima. Blocos grandes (ex.: .head) não cabem
  // inteiramente fora do próprio raio da lemniscata sem destruir a forma,
  // então a magnitude é limitada (não é a distância exata até a borda) —
  // prioriza deformação orgânica e reconhecível sobre eliminação total da
  // sobreposição. Direção mistura os eixos x/y conforme o dominante, para não
  // ter nem instabilidade radial no centro nem costura dura de escolha binária
  // de eixo. Borda macia via smoothstep.
  vec2 ndc = gl_Position.xy / gl_Position.w;
  vec2 textPush = vec2(0.0);
  for (int i = 0; i < ${TEXT_RECT_COUNT}; i++) {
    vec4 r = uTextRect[i];
    if (r.x >= r.z) continue;
    vec2 center = (r.xy + r.zw) * 0.5;
    vec2 half_ = (r.zw - r.xy) * 0.5 + TEXT_PAD;
    vec2 u = (ndc - center) / half_;
    vec2 au = abs(u);
    float d = max(au.x, au.y);
    float influence = 1.0 - smoothstep(0.0, 1.0, clamp(d, 0.0, 1.0));
    if (influence <= 0.0) continue;
    vec2 w = au / (au.x + au.y + 0.0001);
    vec2 dir = normalize(sign(u) * w + 1e-6);
    textPush += dir * influence * TEXT_PUSH;
  }
  // Teto no empurrão somado. Sem isto, uma partícula sob a influência de dois
  // ou três retângulos recebe o empurrão de cada um e é atirada para longe: a
  // lemniscata deixa de ser lemniscata e vira um borrão. O teto mantém o
  // "saia de cima do texto" e descarta só o excesso da soma.
  float pushLen = length(textPush);
  if (pushLen > TEXT_PUSH) textPush *= TEXT_PUSH / pushLen;
  ndc += textPush;
  gl_Position.xy = ndc * gl_Position.w;

  float band = pow(1.0-abs(fract(aT - uTime*0.085)*2.0-1.0),9.0);
  vGlow = band*uFlow + uEnergy*0.3;
  vSeed = aSeed;
  gl_PointSize = (uSize + vGlow*2.3) * (260.0/max(-mv.z,1.0));
}`

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 uWhite,uAmber; uniform float uOpacity;
varying float vGlow; varying float vSeed;
void main(){
  vec2 c = gl_PointCoord-0.5; float d = dot(c,c);
  if(d>0.25) discard;
  float a = smoothstep(0.25,0.0,d);
  vec3 col = mix(uWhite,uAmber, clamp(vGlow,0.0,1.0)*0.9 + step(0.86,vSeed)*0.26);
  gl_FragColor = vec4(col, a*uOpacity*(0.3+vGlow*0.85+vSeed*0.3));
}`

const idle = (cb: () => void) =>
  typeof window.requestIdleCallback === 'function'
    ? window.requestIdleCallback(cb)
    : window.setTimeout(cb, 240)

/**
 * O campo de partículas. Monta uma vez no nível do layout e nunca desmonta,
 * nem na troca de rota — ele atravessa todas as seções e as duas páginas, e a
 * continuidade do estado É o conceito. Fica acima do <Routes> no App
 * justamente por isso: desmontar aqui perderia a posição do morph e a
 * navegação viraria um piscar.
 *
 * O Three.js entra por import dinâmico dentro de requestIdleCallback, então
 * não bloqueia a primeira pintura: o hero fica legível antes de qualquer
 * WebGL existir. Se o tier do aparelho for zero, ou o WebGL falhar, nada é
 * carregado e a página segue inteira sem ele.
 */
export function InfinityField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const tier = resolveTier()
    let disposed = false

    /**
     * Dimensões do viewport, com o último valor válido guardado.
     *
     * Nada no campo lê `window.innerWidth/innerHeight` direto: uma medição de
     * largura ou altura zero, que acontece em remontagem, em aba em segundo
     * plano e em alguns navegadores no meio de um resize, produziria uma
     * proporção absurda. Como o enquadramento do hero é derivado da proporção,
     * uma leitura ruim jogaria a forma para longe e para o topo da tela. Aqui
     * a leitura ruim é simplesmente descartada e a anterior continua valendo.
     */
    let viewW = Math.max(1, window.innerWidth)
    let viewH = Math.max(1, window.innerHeight)
    const readViewport = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      if (w > 0 && h > 0) {
        viewW = w
        viewH = h
      }
    }
    readViewport()

    let layout: LayoutCache = readLayout(viewH)

    /**
     * Cópias locais das tabelas afinadas para o traço fino do trilho. Sem
     * trilho, aqueles valores deixariam a lemniscata do estado 5 quase
     * invisível e imóvel, então ela volta a se parecer com as vizinhas.
     */
    const pointSize = POINT_SIZE.slice()
    const drift = DRIFT.slice()
    const speed = SPEED.slice()
    const flow = FLOW.slice()
    if (!railStretch) {
      pointSize[TRACK_STATE] = 1.4
      drift[TRACK_STATE] = 0.08
      speed[TRACK_STATE] = 0.7
      flow[TRACK_STATE] = 0.35
    }

    // ---- estado do loop -------------------------------------------------
    let sCur = prefersReducedMotion ? REST_STATE : 0
    let sTarget = sCur
    let energy = 0
    let pointerLerpX = 0
    let pointerLerpY = 0
    let restSpin = 0
    let offsetCur = 0
    let offsetYCur = 0
    let pageVisible = true
    /** Abertura em curso. Armada em `loadField`, quando existe o que ver. */
    let opening = false
    let openT = 0
    let openFrom = 0
    let last = performance.now()
    let lastDraw = 0
    let rafId = 0
    /** Movimento reduzido desenha um quadro e para; só resize redesenha. */
    let staticDrawn = false

    // ---- objetos WebGL, preenchidos quando (e se) o Three carregar ------
    /** Só os uniforms numéricos que o loop anima; as cores são fixas. */
    interface AnimatedUniforms {
      uMix: { value: number }
      uTime: { value: number }
      uSize: { value: number }
      uFlow: { value: number }
      uOpacity: { value: number }
      uEnergy: { value: number }
      uDrift: { value: number }
    }
    let live = false
    let pairA = -1
    let states: Float32Array[] = []
    let bufA: Float32Array | null = null
    let bufB: Float32Array | null = null
    let uniforms: AnimatedUniforms | null = null
    /** Array de retângulos protegidos (NDC) enviado ao vertex shader. */
    let textRectUniforms: Array<{ set(x: number, y: number, z: number, w: number): void }> | null =
      null
    let disposeGl: (() => void) | null = null
    let resizeGl: (() => void) | null = null
    let renderGl: (() => void) | null = null
    let applyPair: ((a: number) => void) | null = null
    let setCamera: ((z: number, x: number, y: number) => void) | null = null
    let setGroup:
      | ((x: number, y: number, ry: number, rx: number, rz: number) => void)
      | null = null

    // ---- entrada ---------------------------------------------------------
    fieldRuntime.scrollY = window.scrollY
    fieldRuntime.lastScrollY = window.scrollY
    fieldRuntime.activityAt = performance.now()

    const onScroll = () => {
      const y = window.scrollY
      fieldRuntime.scrollY = y
      fieldRuntime.velocity += Math.abs(y - fieldRuntime.lastScrollY)
      fieldRuntime.lastScrollY = y
      noteActivity()
    }
    const onPointerMove = (e: PointerEvent) => {
      fieldRuntime.pointerX = e.clientX / viewW - 0.5
      fieldRuntime.pointerY = e.clientY / viewH - 0.5
      noteActivity()
    }
    const onOrientation = (e: DeviceOrientationEvent) => {
      fieldRuntime.pointerX = clamp((e.gamma ?? 0) / 60, -0.5, 0.5)
      fieldRuntime.pointerY = clamp(((e.beta ?? 0) - 45) / 90, -0.5, 0.5)
    }
    const onVisibility = () => {
      pageVisible = !document.hidden
      last = performance.now()
    }

    let resizeTimer = 0
    const settleResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        readViewport()
        fieldRuntime.layoutDirty = true
        staticDrawn = false
        resizeGl?.()
      }, 180)
    }

    /**
     * ResizeObserver no elemento raiz em vez de só o evento `resize`: ele
     * também pega mudança de caixa que não vem de redimensionar a janela — a
     * barra de endereço do celular recolhendo, e a troca de idioma, que muda o
     * comprimento das linhas e a altura dos blocos.
     */
    const observer = new ResizeObserver(settleResize)
    observer.observe(document.documentElement)

    // A troca de idioma reflui todo o texto; o enquadramento e os retângulos
    // protegidos precisam ser refeitos depois que a fonte assentar.
    void document.fonts?.ready.then(() => {
      readViewport()
      fieldRuntime.layoutDirty = true
      staticDrawn = false
    })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', settleResize, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    if (!prefersReducedMotion) {
      if (!isCoarsePointer) {
        window.addEventListener('pointermove', onPointerMove, { passive: true })
      } else if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', onOrientation, { passive: true })
      }
    }

    // ---- loop ------------------------------------------------------------
    const lerpState = (table: number[], a: number, mix: number) =>
      table[a] + (table[a + 1] - table[a]) * mix

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick)
      if (!pageVisible) return
      if (prefersReducedMotion && staticDrawn) return

      // Throttle de bateria: parado, sem energia e sem morph em curso, cai
      // para ~15fps no celular / ~25fps no desktop em vez de queimar 60.
      const resting =
        now - fieldRuntime.activityAt > 1300 &&
        energy < 0.02 &&
        Math.abs(sTarget - sCur) < 0.002 &&
        fieldRuntime.mode !== 'rest'
      if (resting && now - lastDraw < (isCoarsePointer ? 66 : 40)) return

      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      lastDraw = now

      if (fieldRuntime.layoutDirty) {
        layout = readLayout(viewH)
        fieldRuntime.layoutDirty = false
      }

      const inRest = fieldRuntime.mode === 'rest'
      sTarget = inRest ? REST_STATE : computeTarget(fieldRuntime.scrollY, layout)

      if (opening) {
        // A abertura é uma curva com começo e fim, não uma perseguição: a
        // nuvem se condensa na lemniscata em tempo fixo, parada nas duas
        // pontas. O primeiro gesto do visitante cancela — quem já decidiu
        // rolar não fica esperando a animação terminar.
        openT = Math.min(1, openT + dt / OPENING_S)
        sCur = openFrom + (sTarget - openFrom) * smootherstep(openT)
        if (openT >= 1 || fieldRuntime.scrollY > viewH * 0.12) opening = false
      } else {
        // Inércia. O morph não é uma função direta do scroll: o alvo se move
        // com a rolagem e o valor renderizado persegue esse alvo com atraso,
        // então a transição começa antes de a seção entrar na tela e termina
        // depois que o texto já assentou. Movimento reduzido vai direto.
        sCur = prefersReducedMotion ? sTarget : damp(sCur, sTarget, 0.005, dt)
      }
      thetaDegrees.set(Math.round(lerpTheta(sCur)))

      energy += (Math.min(fieldRuntime.velocity / 26, 1) - energy) * 0.1
      fieldRuntime.velocity *= 0.8

      if (!live || !uniforms) return

      const a = clamp(Math.floor(sCur), 0, STATE_COUNT - 2)
      const mix = clamp(sCur - a, 0, 1)
      if (a !== pairA) {
        applyPair?.(a)
        pairA = a
      }

      uniforms.uMix.value = mix

      // Um relógio só, acelerado ou freado pela seção. Multiplicar aqui, e não
      // dentro do shader, é o que evita salto de fase quando a velocidade muda.
      const speedNow = lerpState(speed, a, mix)
      uniforms.uTime.value += prefersReducedMotion
        ? 0
        : dt * (1 + energy * 1.5) * speedNow

      if (fieldRuntime.flowBump !== 0) {
        uniforms.uFlow.value = Math.min(
          1.8,
          uniforms.uFlow.value + fieldRuntime.flowBump,
        )
        fieldRuntime.flowBump = 0
      }
      uniforms.uFlow.value = damp(uniforms.uFlow.value, lerpState(flow, a, mix), 0.03, dt)
      uniforms.uSize.value = damp(
        uniforms.uSize.value,
        lerpState(pointSize, a, mix),
        0.03,
        dt,
      )
      uniforms.uDrift.value = damp(
        uniforms.uDrift.value,
        lerpState(drift, a, mix),
        0.03,
        dt,
      )
      uniforms.uEnergy.value = energy
      // Densidade menor no repouso: a lemniscata de /sobre é a mesma forma,
      // respirando mais baixo para não competir com a leitura da página.
      uniforms.uOpacity.value = damp(
        uniforms.uOpacity.value,
        sCur > 0.05 ? (inRest ? 0.62 : 1) : 0,
        0.1,
        dt,
      )

      // Retângulos protegidos da seção mais próxima, convertidos para NDC. Só
      // aritmética — a medição cara (getBoundingClientRect) já está em cache
      // no layout e só se atualiza quando layoutDirty.
      if (textRectUniforms) {
        const nearestState = inRest ? REST_STATE : clamp(Math.round(sCur), 0, STATE_COUNT - 1)
        const rects = layout.textRects[nearestState]
        const vw = viewW
        const vh = viewH
        for (let i = 0; i < textRectUniforms.length; i++) {
          const rect = rects?.[i]
          if (!rect) {
            textRectUniforms[i].set(1, 1, -1, -1)
            continue
          }
          const top = rect.pageTop - fieldRuntime.scrollY
          const xMin = (rect.left / vw) * 2 - 1
          const xMax = ((rect.left + rect.width) / vw) * 2 - 1
          const yMin = 1 - ((top + rect.height) / vh) * 2
          const yMax = 1 - (top / vh) * 2
          textRectUniforms[i].set(xMin, yMin, xMax, yMax)
        }
      }

      pointerLerpX = damp(pointerLerpX, fieldRuntime.pointerX, 0.05, dt)
      pointerLerpY = damp(pointerLerpY, fieldRuntime.pointerY, 0.05, dt)

      // Em repouso a forma não morfa, então quem dá vida é uma rotação lenta e
      // contínua no eixo vertical.
      //
      // Fora do repouso ela precisa *voltar* a zero, e não só parar de crescer.
      // O ângulo acumulado em /sobre continuava somado à rotação do grupo
      // depois da volta para a home, e como ninguém o desfazia, o hero
      // renascia girado pelo tanto de tempo que o visitante tivesse passado
      // lendo a outra página: com treze segundos de leitura são 90°, e a
      // lemniscata aparece exatamente de perfil.
      if (!prefersReducedMotion) {
        if (inRest) {
          restSpin += dt * 0.12
          // Uma volta inteira é a mesma imagem, então o acumulado nunca
          // precisa crescer sem limite — e limitado, o retorno é curto.
          if (restSpin > TAU) restSpin -= TAU
        } else if (restSpin !== 0) {
          // Desenrola pelo caminho mais curto: de 300° avança os 60° que
          // faltam para fechar a volta, em vez de desandar 300° para trás.
          const goal = restSpin > Math.PI ? TAU : 0
          restSpin = damp(restSpin, goal, 0.05, dt)
          if (Math.abs(goal - restSpin) < 0.004) restSpin = 0
        }
      }

      // A coluna de texto fica à esquerda nas seções de trabalho; a
      // lemniscata se muda para a folga da direita em vez de ser desmontada
      // pela repulsão. Em telas estreitas não há folga, então não desloca.
      const wide = viewW >= 900
      offsetCur = damp(
        offsetCur,
        wide ? lerpState(OFFSET_X, a, mix) : 0,
        0.02,
        dt,
      )
      // Enquadramento do hero. A câmera recua o quanto for preciso para a
      // lemniscata caber na largura da tela com folga — numa tela estreita e
      // alta ela precisa ficar menor, senão sangra pelos dois lados e cruza a
      // sobrelinha. O recuo pesa só perto do hero e volta a zero conforme o
      // percurso avança, então nenhuma outra seção encolhe por causa disso.
      const baseZ = lerpState(CAMERA_Z, a, mix)
      const heroWeight = clamp(1 - Math.abs(sCur - 1), 0, 1)
      // A proporção entra travada numa faixa sensata. A lemniscata é
      // horizontal por definição do conceito, e o enquadramento só escolhe
      // escala e altura — nunca orientação. Sem o teto, uma proporção
      // degenerada (janela num instante de zero, aba restaurada) mandaria a
      // câmera para longe e a forma sairia minúscula e colada no topo.
      const aspect = clamp(viewW / viewH, 0.35, 3)
      const fitZ = (HERO_RADIUS * HERO_MARGIN) / (HALF_TAN_FOV * aspect)
      const camZ = clamp(baseZ + heroWeight * Math.max(0, fitZ - baseZ), 8, 120)

      offsetYCur = damp(
        offsetYCur,
        lerpState(OFFSET_Y_FRAC, a, mix) * camZ * HALF_TAN_FOV,
        0.02,
        dt,
      )

      // Achatamento no trilho. Uma reta girada em y e x é lida como diagonal na
      // tela — era exatamente isso que fazia o traço do processo cruzar o texto
      // na diagonal em vez de correr horizontal acima dele. Perto do estado do
      // trilho as três rotações vão a zero, e a linha volta a ser horizontal.
      // Fora dele nada muda: o fator é 0 e as rotações passam intactas.
      const flat = railStretch ? clamp(1 - Math.abs(sCur - TRACK_STATE), 0, 1) : 0
      const spin = 1 - flat

      const time = uniforms.uTime.value
      setGroup?.(
        offsetCur,
        offsetYCur,
        (restSpin + pointerLerpX * 0.5 + Math.sin(time * 0.12) * 0.06 + sCur * 0.18) * spin,
        (-pointerLerpY * 0.32 + Math.cos(time * 0.1) * 0.04) * spin,
        Math.sin(sCur * 0.6) * 0.05 * spin,
      )
      setCamera?.(camZ, pointerLerpX * 3 * spin, -pointerLerpY * 2 * spin)
      renderGl?.()
      if (prefersReducedMotion) staticDrawn = true
    }

    rafId = requestAnimationFrame(tick)

    // ---- Three.js, adiado --------------------------------------------------
    // `loadField` roda uma vez no boot e de novo sempre que o contexto WebGL é
    // recuperado depois de uma perda (ver `onContextRestored` abaixo) — por
    // isso toda a criação de renderer/cena/geometria vive aqui dentro, e não
    // só na primeira chamada.
    let loadingField = false
    const loadField = async () => {
      if (tier.particles === 0 || disposed || loadingField) return
      loadingField = true
      try {
        const THREE = await import('three')
        if (disposed) return

        // Arma a abertura. Só no topo da página: quem recarregou no meio do
        // percurso já tem uma formação certa para aquele scroll, e condensar
        // uma nuvem ali seria inventar um movimento que ninguém pediu.
        if (!prefersReducedMotion && fieldRuntime.scrollY <= viewH * 0.12) {
          sCur = 0
          openFrom = 0
          openT = 0
          opening = true
        }

        // O protótipo foi aprovado sob r128, que renderizava sem gestão de
        // cor. Desligar aqui mantém os hex exatamente como aprovados em vez
        // de passar por conversão sRGB→linear.
        THREE.ColorManagement.enabled = false

        const n = tier.particles
        states = buildStates(n, railStretch)

        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: false,
          alpha: true,
          powerPreference: isCoarsePointer ? 'default' : 'high-performance',
          stencil: false,
          depth: false,
        })
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier.dpr))
        renderer.setSize(viewW, viewH, false)

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(
          FOV,
          viewW / viewH,
          0.1,
          200,
        )
        camera.position.z = 30

        // Buffers próprios: o loop escreve neles a cada troca de estado, e as
        // formações de origem precisam continuar intactas para reuso.
        const first = clamp(Math.floor(sCur), 0, STATE_COUNT - 2)
        bufA = Float32Array.from(states[first])
        bufB = Float32Array.from(states[first + 1])

        const seed = new Float32Array(n)
        const along = new Float32Array(n)
        for (let i = 0; i < n; i++) {
          seed[i] = Math.random()
          along[i] = i / n
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(Float32Array.from(states[first]), 3),
        )
        const attrA = new THREE.BufferAttribute(bufA, 3)
        const attrB = new THREE.BufferAttribute(bufB, 3)
        geometry.setAttribute('aPosA', attrA)
        geometry.setAttribute('aPosB', attrB)
        geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
        geometry.setAttribute('aT', new THREE.BufferAttribute(along, 1))
        geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60)

        // Sentinela desativada (xMin >= xMax) até o primeiro layout ser lido.
        const textRects = Array.from(
          { length: TEXT_RECT_COUNT },
          () => new THREE.Vector4(1, 1, -1, -1),
        )
        textRectUniforms = textRects

        const glUniforms = {
          uMix: { value: 0 },
          uTime: { value: 0 },
          uSize: { value: 1.5 },
          uFlow: { value: 0 },
          uOpacity: { value: 0 },
          uEnergy: { value: 0 },
          uDrift: { value: 0.09 },
          uWhite: { value: new THREE.Color(0xf3f0ea) },
          uAmber: { value: new THREE.Color(0xe2a24a) },
          uTextRect: { value: textRects },
        }

        const material = new THREE.ShaderMaterial({
          uniforms: glUniforms,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
        })

        const points = new THREE.Points(geometry, material)
        const group = new THREE.Group()
        group.add(points)
        scene.add(group)

        applyPair = (a) => {
          bufA!.set(states[a])
          bufB!.set(states[a + 1])
          attrA.needsUpdate = true
          attrB.needsUpdate = true
        }
        setCamera = (z, x, y) => {
          camera.position.z = z
          camera.position.x = x
          camera.position.y = y
          camera.lookAt(0, 0, 0)
        }
        setGroup = (x, y, ry, rx, rz) => {
          group.position.x = x
          group.position.y = y
          group.rotation.y = ry
          group.rotation.x = rx
          group.rotation.z = rz
        }
        renderGl = () => renderer.render(scene, camera)
        resizeGl = () => {
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier.dpr))
          renderer.setSize(viewW, viewH, false)
          camera.aspect = viewW / viewH
          camera.updateProjectionMatrix()
        }
        disposeGl = () => {
          geometry.dispose()
          material.dispose()
          renderer.dispose()
        }

        uniforms = glUniforms
        live = true
        staticDrawn = false
        canvas.classList.add('live')
        fieldLive.set(true)
      } catch {
        live = false
        fieldLive.set(false)
      } finally {
        loadingField = false
      }
    }

    idle(() => {
      void loadField()
    })

    // ---- perda e recuperação de contexto WebGL ----------------------------
    // Sem isto, um contexto perdido (troca de GPU, aba em segundo plano por
    // muito tempo, driver caindo) deixava a canvas congelada sem nunca
    // avisar ninguém: `live` ficava preso em `true` e o loop seguia chamando
    // `renderGl()` num contexto morto. `preventDefault()` é obrigatório no
    // evento de perda — sem ele o navegador nunca tenta restaurar.
    const onContextLost = (e: Event) => {
      e.preventDefault()
      live = false
      fieldLive.set(false)
      canvas.classList.remove('live')
      // Os objetos do Three.js referem-se a um contexto que não existe mais;
      // chamar métodos neles pode lançar. Solta as referências e deixa o
      // `tick()` seguir só com a matemática do morph (ver `if (!live ...)`
      // logo no início do bloco de render).
      renderGl = null
      resizeGl = null
      applyPair = null
      setCamera = null
      setGroup = null
      disposeGl = null
      uniforms = null
      textRectUniforms = null
    }
    const onContextRestored = () => {
      staticDrawn = false
      void loadField()
    }
    canvas.addEventListener('webglcontextlost', onContextLost, false)
    canvas.addEventListener('webglcontextrestored', onContextRestored, false)

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', settleResize)
      observer.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('deviceorientation', onOrientation)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
      disposeGl?.()
      live = false
      fieldLive.set(false)
    }
  }, [])

  return <canvas id="field" ref={canvasRef} aria-hidden="true" />
}

/** θ do estado contínuo, interpolando a tabela de graus por estado. */
function lerpTheta(s: number): number {
  const a = clamp(Math.floor(s), 0, STATE_COUNT - 2)
  return THETA[a] + (THETA[a + 1] - THETA[a]) * clamp(s - a, 0, 1)
}
