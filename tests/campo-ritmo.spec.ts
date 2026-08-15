import { expect, test, type Page } from '@playwright/test'

/**
 * Ritmo e continuidade do campo.
 *
 * Cobre os dois defeitos relatados depois da rodada de fechamento:
 *
 *  - a lemniscata voltava de /sobre girada, porque o ângulo acumulado pela
 *    rotação de repouso continuava somado à rotação do grupo na home;
 *  - o percurso trocava de formação em meia tela de rolagem no topo e depois
 *    ficava morto, porque o tempo do morph era uma fração da altura da seção
 *    medida pelo meio da viewport — no topo da página essa fração já nascia
 *    passada do ponto de partida da transição.
 */

const SETTLE = 1200

async function theta(page: Page): Promise<number> {
  const text = await page.locator('#theta').innerText()
  return Number(text.replace(/\D/g, ''))
}

async function scrollTo(page: Page, y: number, settle = 900) {
  await page.evaluate((v) => window.scrollTo(0, v), Math.round(y))
  await page.waitForTimeout(settle)
}

/**
 * Extensão horizontal das partículas, em pixels.
 *
 * A canvas do WebGL não sobrevive a um `drawImage` (não há
 * `preserveDrawingBuffer`), então a leitura passa por um screenshot decodificado
 * de volta dentro da página. O resto da árvore fica invisível durante a
 * medição: a manchete é clara e entraria na conta como se fosse partícula.
 */
async function fieldWidth(page: Page): Promise<number> {
  const hide = await page.addStyleTag({
    content: '#main,nav,footer,#vignette{opacity:0 !important}',
  })
  await page.waitForTimeout(250)
  const shot = (await page.screenshot()).toString('base64')
  await hide.evaluate((el) => el.remove())

  return page.evaluate(async (b64) => {
    const img = new Image()
    await new Promise((ok) => {
      img.onload = ok
      img.src = 'data:image/png;base64,' + b64
    })
    const off = document.createElement('canvas')
    off.width = img.width
    off.height = img.height
    const cx = off.getContext('2d')!
    cx.drawImage(img, 0, 0)
    const d = cx.getImageData(0, 0, off.width, off.height).data
    let x0 = Infinity
    let x1 = -1
    for (let y = 0; y < off.height; y++) {
      for (let x = 0; x < off.width; x++) {
        const i = (y * off.width + x) * 4
        if (d[i] * 0.21 + d[i + 1] * 0.72 + d[i + 2] * 0.07 > 60) {
          if (x < x0) x0 = x
          if (x > x1) x1 = x
        }
      }
    }
    return x1 < 0 ? 0 : x1 - x0
  }, shot)
}

test.describe('ritmo do percurso', () => {
  test.setTimeout(180_000)

  test('o hero segura a forma antes do primeiro gesto', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3500) // abertura inteira
    const vh = page.viewportSize()!.height

    expect(await theta(page)).toBe(0)

    // Meia tela de rolagem sem trocar de formação: o hero tem trecho próprio.
    // Antes, θ já passava de 40° aqui.
    await scrollTo(page, vh * 0.5)
    expect(await theta(page)).toBe(0)
  })

  test('nenhum salto brusco ao longo do percurso', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)
    const vh = page.viewportSize()!.height
    const max = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    )

    // Amostra a cada décimo de tela. Um morph tem 0,62 tela de extensão, então
    // um décimo nunca pode entregar mais que um punhado de graus.
    let previous = 0
    let worst = 0
    for (let y = 0; y <= max; y += vh * 0.1) {
      await scrollTo(page, y, 420)
      const now = await theta(page)
      // O fim do ciclo volta de 360 para 0 no contador; ignora a virada.
      if (now >= previous) worst = Math.max(worst, now - previous)
      previous = now
    }
    // Teto de sanidade, não a prova da correção — quem prova o defeito
    // relatado é o teste do hero acima. O percurso hoje entrega no máximo 25°
    // por décimo de tela, no morph mais longo (093°→180°, que sozinho vale
    // 87°); a folga aqui é para variação de máquina, não para regressão.
    expect(worst).toBeLessThanOrEqual(32)
  })

  test('o ciclo fecha em 360 no fim do documento', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)
    const max = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    )
    await scrollTo(page, max, 2000)
    expect(await theta(page)).toBeGreaterThanOrEqual(352)
  })
})

test.describe('continuidade entre rotas', () => {
  test.setTimeout(180_000)

  test('voltar de /sobre não deixa a lemniscata girada', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3500)
    const before = await fieldWidth(page)
    expect(before).toBeGreaterThan(200) // o campo está vivo e visível

    await page.getByRole('link', { name: /sobre|about/i }).first().click()
    await page.waitForURL('**/sobre')
    // A rotação de repouso corre a 0,12 rad/s: quinze segundos são ~103°, o
    // bastante para a forma chegar de perfil se o ângulo vazar para a home.
    await page.waitForTimeout(15_000)

    await page.goBack()
    await page.waitForURL((url) => !url.pathname.includes('sobre'))
    await page.waitForTimeout(SETTLE * 3) // desenrola até zero

    const after = await fieldWidth(page)
    // De perfil a largura despencaria; aqui ela tem que voltar praticamente
    // igual à da primeira carga.
    expect(Math.abs(after - before) / before).toBeLessThan(0.12)
  })
})
