import { expect, test, type Page } from '@playwright/test'

/**
 * P0.1 — navegação por âncora.
 *
 * O React Router não rola para o hash sozinho: `/#cta` só trocava a URL e a
 * página ficava no hero. Cobre os dois caminhos, clique e acesso direto com
 * recarga, e confere que o destino para logo abaixo da barra fixa em vez de
 * ficar por baixo dela.
 */

/**
 * Tolerância do destino, em pixels, contra a altura do nav.
 *
 * Folgada de propósito: o que este teste prova é que a âncora chega ao
 * contato em vez de ficar a milhares de pixels dele, e que para abaixo da
 * barra fixa. Alguns pixels de diferença entre motores vêm de arredondamento
 * de layout e de `100svh`, não de regressão.
 */
const NAV_H = 72
const SLACK = 28

async function skipIntro(page: Page) {
  await page.mouse.click(5, 5)
  await expect(page.locator('#introOverlay')).toHaveCount(0, { timeout: 3000 })
}

async function ctaTop(page: Page) {
  return page.locator('#cta').evaluate((el) => Math.round(el.getBoundingClientRect().top))
}

test.describe('âncora — clique no nav', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('CONTATO leva até o contato e deixa o hash na URL', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)

    await page.getByRole('link', { name: /contato|contact/i }).first().click()

    await expect(async () => {
      expect(Math.abs((await ctaTop(page)) - NAV_H)).toBeLessThanOrEqual(SLACK)
    }).toPass({ timeout: 5000 })

    expect(page.url()).toContain('#cta')
  })

  test('INÍCIO volta ao topo estando já na home', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)
    await page.evaluate(() => window.scrollTo(0, 3000))
    await page.waitForTimeout(200)

    await page.getByRole('link', { name: /^(início|home)$/i }).first().click()

    await expect(async () => {
      expect(await page.evaluate(() => window.scrollY)).toBeLessThan(4)
    }).toPass({ timeout: 5000 })
  })
})

test.describe('âncora — acesso direto com recarga', () => {
  for (const width of [1440, 390]) {
    test(`/#cta abre já no contato @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
      await page.goto('/#cta')

      // O destino real só existe depois que as fontes e a medição do trilho
      // assentam; o utilitário reconfere sozinho, então basta esperar. O prazo
      // é largo porque quem assenta é o layout, não o teste: com a suíte
      // inteira em paralelo nos três motores, oito segundos já falharam por
      // disputa de CPU numa máquina saudável.
      await expect(async () => {
        expect(Math.abs((await ctaTop(page)) - NAV_H)).toBeLessThanOrEqual(SLACK)
      }).toPass({ timeout: 20_000 })

      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(500)
    })
  }
})
