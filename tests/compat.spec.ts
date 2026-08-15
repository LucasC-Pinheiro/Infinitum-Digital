import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

/**
 * Varredura de compatibilidade (item 5 do documento): console limpo nos três
 * motores, fallback e recuperação de contexto WebGL, evidência em screenshot
 * nos 8 viewports pedidos, e um smoke de CPU throttled.
 */

const VIEWPORTS = [360, 390, 430, 768, 1024, 1280, 1440, 1920]
const EVIDENCE_DIR = path.join(process.cwd(), 'qa-evidence')

test.beforeAll(() => {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true })
})

test('console limpo na home inteira', async ({ page, browserName }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/')
  await page.mouse.click(5, 5) // skip da abertura
  await expect(page.locator('#introOverlay')).toHaveCount(0, { timeout: 2000 })

  // Rola a página inteira, de ponta a ponta, para forçar a montagem de todas
  // as seções (inclusive o pin do processo).
  await page.evaluate(async () => {
    const step = () =>
      new Promise<void>((resolve) => {
        window.scrollBy(0, window.innerHeight * 0.9)
        requestAnimationFrame(() => setTimeout(resolve, 60))
      })
    for (let i = 0; i < 25; i++) await step()
  })

  expect(errors, `console sujo em ${browserName}: ${errors.join('\n')}`).toEqual([])
})

test('perda e recuperação de contexto WebGL cai no fallback estático', async ({
  page,
  browserName,
}) => {
  test.skip(browserName === 'webkit', 'WEBGL_lose_context tem suporte inconsistente no WebKit')

  await page.goto('/')
  await page.mouse.click(5, 5)
  await expect(page.locator('#introOverlay')).toHaveCount(0, { timeout: 2000 })

  // A extensão precisa ser obtida uma única vez e reutilizada: pedir de novo
  // via `getExtension` depois que o contexto já está perdido não é confiável
  // entre motores (o handle da extensão, não o contexto, é o que garante
  // `restoreContext()` — por spec é a única extensão que segue disponível
  // com o contexto perdido, mas guardar o handle evita depender disso).
  const hasExtension = await page.evaluate(() => {
    const canvas = document.getElementById('field') as HTMLCanvasElement | null
    const gl = canvas?.getContext('webgl2') ?? canvas?.getContext('webgl')
    const ext = gl?.getExtension('WEBGL_lose_context')
    if (!ext) return false
    // @ts-expect-error -- ponte deliberada para reuso entre evaluate() calls
    window.__loseCtx = ext
    return true
  })
  test.skip(!hasExtension, 'Extensão WEBGL_lose_context indisponível neste ambiente')

  // Dá tempo do Three.js subir (import adiado via requestIdleCallback).
  await expect(page.locator('#field.live')).toBeVisible({ timeout: 8000 })
  await expect(page.locator('#fieldFallback[data-show]')).toHaveCount(0)

  await page.evaluate(() => {
    // @ts-expect-error -- ver ponte acima
    window.__loseCtx.loseContext()
  })

  await expect(page.locator('#fieldFallback[data-show]')).toBeVisible({ timeout: 3000 })

  await page.evaluate(() => {
    // @ts-expect-error -- ver ponte acima
    window.__loseCtx.restoreContext()
  })

  await expect(page.locator('#field.live')).toBeVisible({ timeout: 8000 })
  await expect(page.locator('#fieldFallback[data-show]')).toHaveCount(0, { timeout: 3000 })
})

for (const width of VIEWPORTS) {
  test(`screenshot de evidência @ ${width}px`, async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Chromium + WebKit já cobrem a matriz de viewport')

    await page.setViewportSize({ width, height: Math.max(700, Math.round(width * 1.2)) })
    await page.goto('/')
    await page.mouse.click(5, 5)
    await expect(page.locator('#introOverlay')).toHaveCount(0, { timeout: 2000 })
    await page.waitForTimeout(400) // deixa o campo assentar antes da foto

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, `${browserName}-${width}.png`),
      fullPage: false,
    })
  })
}

test('CPU 4x throttled: abertura e seção horizontal seguem usáveis', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Emulation.setCPUThrottlingRate é só CDP/Chromium')

  const client = await page.context().newCDPSession(page)
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 })

  const start = Date.now()
  await page.goto('/')
  await expect(page.locator('#introOverlay')).toHaveCount(0, { timeout: 6000 })
  await expect(page.locator('#hero')).toBeVisible()
  const introMs = Date.now() - start
  // Não é uma medição de fps de verdade, mas garante que o throttle não trava
  // a abertura indefinidamente — ela precisa terminar numa janela sensata.
  expect(introMs).toBeLessThan(6000)

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.locator('#process').scrollIntoViewIfNeeded()
  await page.mouse.wheel(0, 800)
  await page.waitForTimeout(300)
  const anyActive = await page
    .locator('.processProgress span')
    .evaluateAll((spans) => spans.some((el) => el.className.includes('on')))
  expect(anyActive).toBe(true)

  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 })
})
