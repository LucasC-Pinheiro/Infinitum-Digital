import { expect, test, type Page } from '@playwright/test'

/**
 * A abertura animada foi removida: o site abre direto no hero. Estes testes
 * existem para que ela não volte por acidente — nem o overlay, nem a trava de
 * scroll, nem a chave de sessão que controlava a primeira visita.
 */

async function heroReady(page: Page) {
  await expect(page.locator('#hero')).toBeVisible()
  await expect(page.locator('#introOverlay')).toHaveCount(0)
}

test('abre direto no hero, sem cortina, na primeira visita', async ({ page }) => {
  await page.goto('/')
  // Sem margem nenhuma: nada pode cobrir o hero em nenhum momento.
  await heroReady(page)
  await expect(page.locator('#heroSvg')).toBeVisible()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

test('segue abrindo direto no hero em visitas seguintes', async ({ page }) => {
  await page.goto('/')
  await heroReady(page)
  await page.reload()
  await heroReady(page)
})

test('não trava o scroll do body', async ({ page }) => {
  await page.goto('/')
  await heroReady(page)
  const overflow = await page.evaluate(() => getComputedStyle(document.body).overflowY)
  expect(overflow).not.toBe('hidden')

  await page.evaluate(() => window.scrollTo(0, 800))
  await page.waitForTimeout(200)
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100)
})

test('não sobrou chave de sessão da abertura', async ({ page }) => {
  await page.goto('/')
  await heroReady(page)
  const keys = await page.evaluate(() => Object.keys(sessionStorage))
  expect(keys.filter((k) => /intro/i.test(k))).toEqual([])
})

test('o traço do hero corre sozinho, sem depender de gesto', async ({ page }) => {
  await page.goto('/')
  await heroReady(page)
  // `carveOnce` arma a máscara: o dash passa a ser controlado por style.
  await expect(async () => {
    const armed = await page
      .locator('#carvePath')
      .evaluate((el) => (el as SVGPathElement).style.strokeDasharray !== '')
    expect(armed).toBe(true)
  }).toPass({ timeout: 3000 })
})
