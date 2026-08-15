import { expect, test } from '@playwright/test'

/**
 * Seção horizontal do processo (ver src/components/sections/Process.tsx).
 * Cobre os itens 3–5 e 10 do checklist: pin de ponta a ponta em 1440, layout
 * vertical em 390 sem scroll horizontal, teclado com scroll acompanhando o
 * foco, e prefers-reduced-motion em fluxo vertical mesmo em tela larga.
 */

const DESKTOP = { width: 1440, height: 900 }
const MOBILE = { width: 390, height: 844 }

async function skipIntro(page: import('@playwright/test').Page) {
  await page.mouse.click(5, 5)
  await expect(page.locator('#introOverlay')).toHaveCount(0, { timeout: 2000 })
}

test.describe('processo — desktop 1440, pin horizontal', () => {
  test.use({ viewport: DESKTOP })

  test('percorre as quatro paradas e volta, sem vazar scroll horizontal', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)

    await page.locator('#process').scrollIntoViewIfNeeded()

    const progress = page.locator('.processProgress span')
    await expect(progress).toHaveCount(4)

    const activeIndex = async () => {
      for (let i = 0; i < 4; i++) {
        const cls = await progress.nth(i).getAttribute('class')
        if (cls?.includes('on')) return i
      }
      return -1
    }

    // Sobe até a última parada, checando que a página nunca ganha barra de
    // rolagem horizontal (o overflow do trilho tem que ficar contido em
    // `.processPin`, nunca vazar para o documento).
    let reachedLast = false
    for (let i = 0; i < 40 && !reachedLast; i++) {
      await page.mouse.wheel(0, 240)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow).toBeLessThanOrEqual(1)
      if ((await activeIndex()) === 3) reachedLast = true
    }
    expect(reachedLast).toBe(true)

    // Continua até a seção seguinte existir na tela, confirmando que o pin
    // solta de verdade no fim (não trava o scroll).
    await page.locator('#reach').scrollIntoViewIfNeeded()
    await expect(page.locator('#reach')).toBeVisible()

    // E volta: rolando para trás, o indicador tem que regredir também.
    for (let i = 0; i < 40; i++) {
      await page.mouse.wheel(0, -240)
      if ((await activeIndex()) === 0) break
    }
    expect(await activeIndex()).toBe(0)
  })

  test('teclado: foco numa parada move o scroll até ela', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)
    await page.locator('#process').scrollIntoViewIfNeeded()

    const thirdStop = page.locator('.stop').nth(2)
    await thirdStop.focus()

    await expect(async () => {
      const cls = await page.locator('.processProgress span').nth(2).getAttribute('class')
      expect(cls).toContain('on')
    }).toPass({ timeout: 2000 })
  })
})

test.describe('processo — mobile 390, fluxo vertical', () => {
  test.use({ viewport: MOBILE })

  test('sem pin, sem scroll horizontal, traço vertical', async ({ page }) => {
    await page.goto('/')
    await skipIntro(page)
    await page.locator('#process').scrollIntoViewIfNeeded()

    const flexDirection = await page
      .locator('.processTrack')
      .evaluate((el) => getComputedStyle(el).flexDirection)
    expect(flexDirection).toBe('column')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)

    // As quatro paradas já estão todas endereçáveis em fluxo, sem precisar
    // de nenhum estado de scroll especial.
    await expect(page.locator('.stop')).toHaveCount(4)
  })
})

test.describe('processo — prefers-reduced-motion', () => {
  test.use({ viewport: DESKTOP })

  test('fluxo vertical mesmo em tela larga, sem pin', async ({ page }) => {
    // `test.use({ reducedMotion: 'reduce' })` não se mostrou confiável nesta
    // versão do Playwright — `emulateMedia` antes do goto funciona de
    // verdade (ver mesmo ajuste em intro.spec.ts).
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.locator('#introOverlay')).toHaveCount(0)
    await page.locator('#process').scrollIntoViewIfNeeded()

    const flexDirection = await page
      .locator('.processTrack')
      .evaluate((el) => getComputedStyle(el).flexDirection)
    expect(flexDirection).toBe('column')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })
})
