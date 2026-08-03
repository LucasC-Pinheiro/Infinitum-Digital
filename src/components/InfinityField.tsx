import { useEffect, useRef } from 'react'
import { buzz, isCoarsePointer, prefersReducedMotion } from '@/lib/env'
import { clamp, damp } from '@/lib/field/math'
import { computeProgress, readLayout, type LayoutCache } from '@/lib/field/layout'
import { fieldRuntime, noteActivity } from '@/lib/field/runtime'
import { collapseDeep, thetaDegrees } from '@/lib/field/signals'
import {
  buildStates,
  CAMERA_Z,
  FLOW,
  POINT_SIZE,
  STATE_COUNT,
} from '@/lib/field/states'
import { resolveTier } from '@/lib/field/tier'

const VERTEX_SHADER = `
attribute vec3 aPosA; attribute vec3 aPosB; attribute float aSeed; attribute float aT;
uniform float uMix,uTime,uSize,uFlow,uPulse,uEnergy;
varying float vGlow; varying float vSeed;
void main(){
  vec3 p = mix(aPosA,aPosB,uMix);
  float s = aSeed*6.2831;
  float amp = 0.09 + uEnergy*0.5;
  p.x += sin(uTime*0.55 + s)*amp;
  p.y += cos(uTime*0.47 + s*1.7)*amp;
  p.z += sin(uTime*0.41 + s*2.3)*(amp*1.3);
  vec4 mv = modelViewMatrix*vec4(p,1.0);
  gl_Position = projectionMatrix*mv;
  float band = pow(1.0-abs(fract(aT - uTime*0.085)*2.0-1.0),9.0);
  float ring = pow(1.0-abs(fract(aT - uPulse)*2.0-1.0),16.0)*step(0.001,uPulse);
  vGlow = band*uFlow + ring + uEnergy*0.3;
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
 * O campo de partículas. Monta uma vez no nível do layout e nunca desmonta —
 * ele atravessa todas as seções e a continuidade do estado É o conceito.
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
    let rail: HTMLElement | null = null
    let layout: LayoutCache = readLayout(null)

    // ---- estado do loop -------------------------------------------------
    let sCur = 0
    let sTarget = 0
    let eclipse = 0
    let eclipseTarget = 0
    let eclipseLast = -1
    let energy = 0
    let pointerLerpX = 0
    let pointerLerpY = 0
    let railCur = 0
    let lastDeep = false
    let pageVisible = true
    let last = performance.now()
    let lastDraw = 0
    let rafId = 0

    // ---- objetos WebGL, preenchidos quando (e se) o Three carregar ------
    /** Só os uniforms numéricos que o loop anima; as cores são fixas. */
    interface AnimatedUniforms {
      uMix: { value: number }
      uTime: { value: number }
      uSize: { value: number }
      uFlow: { value: number }
      uOpacity: { value: number }
      uPulse: { value: number }
      uEnergy: { value: number }
    }
    let live = false
    let pairA = -1
    let states: Float32Array[] = []
    let bufA: Float32Array | null = null
    let bufB: Float32Array | null = null
    let uniforms: AnimatedUniforms | null = null
    let disposeGl: (() => void) | null = null
    let resizeGl: (() => void) | null = null
    let renderGl: (() => void) | null = null
    let applyPair: ((a: number) => void) | null = null
    let setCamera: ((z: number, x: number, y: number, lookX: number) => void) | null =
      null
    let setGroup: ((x: number, ry: number, rx: number, rz: number) => void) | null =
      null

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
      fieldRuntime.pointerX = e.clientX / window.innerWidth - 0.5
      fieldRuntime.pointerY = e.clientY / window.innerHeight - 0.5
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
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        fieldRuntime.layoutDirty = true
        resizeGl?.()
      }, 180)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    if (!isCoarsePointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
    } else if (window.DeviceOrientationEvent && !prefersReducedMotion) {
      window.addEventListener('deviceorientation', onOrientation, { passive: true })
    }

    // ---- loop ------------------------------------------------------------
    const lerpState = (table: number[], a: number, mix: number) =>
      table[a] + (table[a + 1] - table[a]) * mix

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick)
      if (!pageVisible) return

      // Throttle de bateria: parado, sem energia e sem pulso, cai para ~15fps
      // no celular / ~25fps no desktop em vez de queimar 60.
      const resting =
        now - fieldRuntime.activityAt > 1300 &&
        energy < 0.02 &&
        fieldRuntime.pulse <= 0 &&
        Math.abs(sTarget - sCur) < 0.002
      if (resting && now - lastDraw < (isCoarsePointer ? 66 : 40)) return

      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      lastDraw = now

      if (fieldRuntime.layoutDirty) {
        rail = rail ?? document.getElementById('rail')
        layout = readLayout(rail)
        fieldRuntime.layoutDirty = false
      }

      const progress = computeProgress(
        fieldRuntime.scrollY,
        window.innerHeight,
        layout,
      )
      sTarget = progress.target
      eclipseTarget = progress.eclipse

      if (progress.deep !== lastDeep) {
        lastDeep = progress.deep
        collapseDeep.set(progress.deep)
        if (progress.deep) buzz(18)
      }

      sCur = prefersReducedMotion ? sTarget : damp(sCur, sTarget, 0.0016, dt)
      eclipse = damp(eclipse, eclipseTarget, 0.02, dt)
      if (Math.abs(eclipse - eclipseLast) > 0.004) {
        eclipseLast = eclipse
        document.documentElement.style.setProperty('--ecl', eclipse.toFixed(3))
      }
      thetaDegrees.set(Math.round((sCur / (STATE_COUNT - 1)) * 360))

      energy += (Math.min(fieldRuntime.velocity / 26, 1) - energy) * 0.1
      fieldRuntime.velocity *= 0.8
      if (fieldRuntime.pulse > 0) fieldRuntime.pulse -= dt * 0.55

      if (!live || !uniforms) return

      const a = clamp(Math.floor(sCur), 0, STATE_COUNT - 2)
      const mix = clamp(sCur - a, 0, 1)
      if (a !== pairA) {
        applyPair?.(a)
        pairA = a
      }

      uniforms.uMix.value = mix
      uniforms.uTime.value += prefersReducedMotion ? 0 : dt * (1 + energy * 1.5)

      if (fieldRuntime.flowBump !== 0) {
        uniforms.uFlow.value = Math.min(
          1.8,
          uniforms.uFlow.value + fieldRuntime.flowBump,
        )
        fieldRuntime.flowBump = 0
      }
      uniforms.uFlow.value = damp(uniforms.uFlow.value, lerpState(FLOW, a, mix), 0.03, dt)
      uniforms.uSize.value = damp(
        uniforms.uSize.value,
        lerpState(POINT_SIZE, a, mix),
        0.03,
        dt,
      )
      uniforms.uEnergy.value = energy * (1 - eclipse)
      uniforms.uPulse.value = fieldRuntime.pulse > 0 ? 1 - fieldRuntime.pulse : 0
      uniforms.uOpacity.value = damp(uniforms.uOpacity.value, sCur > 0.05 ? 1 : 0, 0.1, dt)

      pointerLerpX = damp(pointerLerpX, fieldRuntime.pointerX, 0.05, dt)
      pointerLerpY = damp(pointerLerpY, fieldRuntime.pointerY, 0.05, dt)

      // O grupo desliza junto com o trilho horizontal da seção Sobre, mas só
      // enquanto o campo está no estado 6 — daí o peso por distância.
      const railWeight = Math.max(0, 1 - Math.abs(sCur - 6))
      railCur = damp(railCur, -fieldRuntime.railOffset * 20 * railWeight, 0.03, dt)

      const time = uniforms.uTime.value
      setGroup?.(
        railCur,
        pointerLerpX * 0.5 + Math.sin(time * 0.12) * 0.06 + sCur * 0.18,
        -pointerLerpY * 0.32 + Math.cos(time * 0.1) * 0.04,
        Math.sin(sCur * 0.6) * 0.05,
      )
      setCamera?.(lerpState(CAMERA_Z, a, mix), pointerLerpX * 3, -pointerLerpY * 2, railCur * 0.35)
      renderGl?.()
    }

    rafId = requestAnimationFrame(tick)

    // ---- Three.js, adiado ------------------------------------------------
    const loadField = async () => {
      if (tier.particles === 0 || disposed) return
      try {
        const THREE = await import('three')
        if (disposed) return

        // O protótipo foi aprovado sob r128, que renderizava sem gestão de
        // cor. Desligar aqui mantém os hex exatamente como aprovados em vez
        // de passar por conversão sRGB→linear.
        THREE.ColorManagement.enabled = false

        const n = tier.particles
        states = buildStates(n)

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
        renderer.setSize(window.innerWidth, window.innerHeight, false)

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(
          42,
          window.innerWidth / window.innerHeight,
          0.1,
          200,
        )
        camera.position.z = 30

        // Buffers próprios: o loop escreve neles a cada troca de estado, e as
        // formações de origem precisam continuar intactas para reuso.
        bufA = Float32Array.from(states[0])
        bufB = Float32Array.from(states[1])

        const seed = new Float32Array(n)
        const along = new Float32Array(n)
        for (let i = 0; i < n; i++) {
          seed[i] = Math.random()
          along[i] = i / n
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(Float32Array.from(states[0]), 3),
        )
        const attrA = new THREE.BufferAttribute(bufA, 3)
        const attrB = new THREE.BufferAttribute(bufB, 3)
        geometry.setAttribute('aPosA', attrA)
        geometry.setAttribute('aPosB', attrB)
        geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
        geometry.setAttribute('aT', new THREE.BufferAttribute(along, 1))
        geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60)

        const glUniforms = {
          uMix: { value: 0 },
          uTime: { value: 0 },
          uSize: { value: 1.5 },
          uFlow: { value: 0 },
          uOpacity: { value: 0 },
          uPulse: { value: 0 },
          uEnergy: { value: 0 },
          uWhite: { value: new THREE.Color(0xf3f0ea) },
          uAmber: { value: new THREE.Color(0xe2a24a) },
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
        setCamera = (z, x, y, lookX) => {
          camera.position.z = z
          camera.position.x = x
          camera.position.y = y
          camera.lookAt(lookX, 0, 0)
        }
        setGroup = (x, ry, rx, rz) => {
          group.position.x = x
          group.rotation.y = ry
          group.rotation.x = rx
          group.rotation.z = rz
        }
        renderGl = () => renderer.render(scene, camera)
        resizeGl = () => {
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier.dpr))
          renderer.setSize(window.innerWidth, window.innerHeight, false)
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
        }
        disposeGl = () => {
          geometry.dispose()
          material.dispose()
          renderer.dispose()
        }

        uniforms = glUniforms
        live = true
        canvas.classList.add('live')
      } catch {
        live = false
      }
    }

    idle(() => {
      void loadField()
    })

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('deviceorientation', onOrientation)
      document.removeEventListener('visibilitychange', onVisibility)
      disposeGl?.()
      live = false
    }
  }, [])

  return <canvas id="field" ref={canvasRef} aria-hidden="true" />
}
