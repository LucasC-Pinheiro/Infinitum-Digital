import { lemniscate } from '@/lib/field/math'
import { fieldLive, useSignal } from '@/lib/field/signals'

const TAU = 6.2831

/**
 * Traço estático da lemniscata em repouso, amostrado com a mesma função que
 * gera as formações do campo, para que o desenho leia como a mesma marca e
 * não como um substituto genérico.
 */
function buildPath(): string {
  let d = ''
  for (let i = 0; i <= 240; i++) {
    const t = (i / 240) * TAU
    const p = lemniscate(t, 34)
    d += `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)} `
  }
  return `${d.trim()} Z`
}

const PATH = buildPath()

/**
 * Rede de segurança visual: nenhuma tela pode ficar preta.
 *
 * Fica sempre montado ao lado do `<InfinityField>`, mas só visível quando o
 * sinal `fieldLive` está falso — sem WebGL, com a inicialização do Three.js
 * falhando, ou durante uma perda de contexto (ver `InfinityField.tsx`). É só
 * um `<path>` estático em SVG, então não depende de nada que possa falhar.
 */
export function FieldFallback() {
  const live = useSignal(fieldLive)

  return (
    <div id="fieldFallback" aria-hidden="true" data-show={live ? undefined : ''}>
      <svg viewBox="-40 -26 80 52" role="presentation">
        <path d={PATH} />
      </svg>
    </div>
  )
}
