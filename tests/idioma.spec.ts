import { expect, test, type Page } from '@playwright/test'

/**
 * Troca de idioma. O sintoma relatado era a lemniscata girando para a
 * vertical, encolhida e colada no topo, empurrando o hero para baixo — sinal
 * de campo remontado e medido antes do layout assentar.
 *
 * O que se afere aqui é geometria, não pixel: o canvas continua o mesmo
 * elemento (não remontou), cobre a tela inteira em posição fixa, e o hero não
 * se desloca. Somado a isso, a orientação da forma é constante do conceito e
 * o enquadramento entra travado numa faixa de proporção (ver InfinityField).
 */

/** Marca o canvas para detectar remontagem: um nó novo não carrega a marca. */
async function stampCanvas(page: Page) {
  await page.evaluate(() => {
    const el = document.getElementById('field') as HTMLCanvasElement & { __stamp?: number }
    el.__stamp = 42
  })
}

async function readState(page: Page) {
  return page.evaluate(() => {
    const el = document.getElementById('field') as (HTMLCanvasElement & { __stamp?: number }) | null
    const hero = document.getElementById('hero')
    const cs = el ? getComputedStyle(el) : null
    const r = el?.getBoundingClientRect()
    return {
      sameNode: el?.__stamp === 42,
      position: cs?.position,
      w: r ? Math.round(r.width) : 0,
      h: r ? Math.round(r.height) : 0,
      // Posição do hero no documento, e não na tela: imune à restauração de
      // scroll do navegador, e é exatamente o que denuncia "hero empurrado
      // para baixo" por um elemento que apareceu acima dele.
      heroDocTop: hero
        ? Math.round(hero.getBoundingClientRect().top + window.scrollY)
        : null,
      lang: document.documentElement.lang,
    }
  })
}

async function switchTo(page: Page, code: 'PT' | 'EN') {
  await page.getByRole('button', { name: code, exact: true }).click()
  await page.waitForTimeout(700)
}

for (const [width, height] of [
  [1440, 900],
  [390, 844],
] as const) {
  test.describe(`idioma @ ${width}px`, () => {
    test.use({ viewport: { width, height }, locale: 'pt-BR' })

    test('cinco trocas seguidas no hero não mexem na forma', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('#hero')).toBeVisible()
      await page.waitForTimeout(1200)
      await stampCanvas(page)

      const base = await readState(page)
      expect(base.lang).toBe('pt-BR')

      for (let i = 1; i <= 5; i++) {
        await switchTo(page, i % 2 === 1 ? 'EN' : 'PT')
        const now = await readState(page)
        expect(now.sameNode, `troca ${i}: o campo remontou`).toBe(true)
        expect(now.position).toBe('fixed')
        expect(now.w).toBe(width)
        expect(now.h).toBe(height)
        expect(now.heroDocTop, `troca ${i}: o hero se deslocou`).toBe(0)
      }
    })

    test('troca no meio do scroll não mexe na forma', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('#hero')).toBeVisible()
      await page.waitForTimeout(1200)
      await stampCanvas(page)

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.45))
      await page.waitForTimeout(500)

      for (const code of ['EN', 'PT', 'EN'] as const) {
        await switchTo(page, code)
        const now = await readState(page)
        expect(now.sameNode).toBe(true)
        expect(now.position).toBe('fixed')
        expect(now.w).toBe(width)
        expect(now.h).toBe(height)
      }
      // Continua sem barra horizontal depois das trocas.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow).toBeLessThanOrEqual(1)
    })
  })
}

test.describe('locale do navegador em inglês', () => {
  test.use({ viewport: { width: 1440, height: 900 }, locale: 'en-US' })

  test('abre em EN e sobrevive a recarga, sem girar a forma', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#hero')).toBeVisible()
    await page.waitForTimeout(1200)

    let s = await readState(page)
    expect(s.lang).toBe('en')
    expect(s.position).toBe('fixed')
    expect(s.w).toBe(1440)
    expect(s.h).toBe(900)
    expect(s.heroDocTop).toBe(0)

    await page.reload()
    await expect(page.locator('#hero')).toBeVisible()
    await page.waitForTimeout(1200)

    s = await readState(page)
    expect(s.lang).toBe('en')
    expect(s.position).toBe('fixed')
    expect(s.w).toBe(1440)
    expect(s.h).toBe(900)
    expect(s.heroDocTop).toBe(0)
  })
})
