import { expect, test, type Page } from '@playwright/test'

/**
 * P0.3 e P0.4 — nenhuma tela vazia e nada de texto debaixo do nav.
 *
 * Percorre a home inteira de cima a baixo, e depois de baixo para cima, em
 * cada viewport. Dois invariantes por parada: existe texto visível na tela, e
 * nenhum bloco de texto ocupa a faixa da barra fixa em repouso.
 */

const NAV_H = 72

async function skipIntro(page: Page) {
  await page.mouse.click(5, 5)
  await expect(page.locator('#introOverlay')).toHaveCount(0, { timeout: 3000 })
}

/** Quantos blocos de texto de conteúdo estão visíveis no viewport agora. */
function countVisibleText(page: Page) {
  return page.evaluate(() => {
    const nodes = document.querySelectorAll<HTMLElement>(
      'main h1, main h2, main h3, main p, main li, main .label',
    )
    let n = 0
    for (const el of nodes) {
      const r = el.getBoundingClientRect()
      const onScreen = r.bottom > 48 && r.top < window.innerHeight - 24
      if (onScreen && r.height > 0 && (el.textContent ?? '').trim()) n++
    }
    return n
  })
}

/**
 * Uma tela só conta como vazia se continuar vazia depois de o layout assentar.
 * A seção de processo é sticky e mede a si mesma, então logo depois de um
 * salto de scroll existe um quadro em que a posição ainda não convergiu — e
 * isso não é um viewport vazio, é a medição em curso.
 */
async function isReallyEmpty(page: Page): Promise<boolean> {
  if ((await countVisibleText(page)) > 0) return false
  await page.waitForTimeout(400)
  return (await countVisibleText(page)) === 0
}

/**
 * Espera a altura do documento parar de mudar.
 *
 * A seção de processo mede a própria sobra horizontal e só então ganha a
 * altura final (`--rail-travel`, ver Process.tsx). Percorrer a página a
 * partir de uma altura lida antes disso faz o teste rolar para posições que
 * deixam de existir quando a medição chega — que foi exatamente o falso
 * negativo visto aqui sob carga, com vários workers no mesmo servidor.
 */
async function stableHeight(page: Page): Promise<number> {
  let last = -1
  for (let i = 0; i < 25; i++) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight)
    if (h === last) return h
    last = h
    await page.waitForTimeout(200)
  }
  return last
}

for (const [width, height] of [
  [1440, 900],
  [390, 844],
] as const) {
  test.describe(`percurso @ ${width}px`, () => {
    test.use({ viewport: { width, height } })

    test('nenhum viewport sem texto, ida e volta', async ({ page }) => {
      // Percorre a página inteira duas vezes, parando em cada tela. Com a
      // seção de processo esticada pelo trilho isso passa de trinta paradas,
      // e o teto padrão de 30s não cobre isso com vários workers no mesmo
      // servidor de dev.
      test.setTimeout(150_000)
      await page.goto('/')
      await skipIntro(page)
      await page.waitForTimeout(600)

      const total = await stableHeight(page)
      const step = Math.round(height * 0.7)
      const empty: number[] = []

      for (let y = 0; y < total; y += step) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y)
        await page.waitForTimeout(320)
        if (await isReallyEmpty(page)) empty.push(y)
      }
      for (let y = total; y >= 0; y -= step) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y)
        await page.waitForTimeout(320)
        if (await isReallyEmpty(page)) empty.push(y)
      }

      expect(empty, `viewports sem texto em y=${empty.join(', ')}`).toEqual([])
    })

    test('conteúdo em repouso não nasce debaixo da barra fixa', async ({ page }) => {
      await page.goto('/')
      await skipIntro(page)
      await page.waitForTimeout(600)

      // Em repouso no topo de cada seção: o primeiro bloco de texto precisa
      // começar abaixo da faixa do nav.
      const ids = ['#hero', '#build', '#auto', '#cross', '#process', '#reach', '#cta']
      for (const id of ids) {
        const top = await page
          .locator(id)
          .evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
        await page.evaluate((y) => window.scrollTo(0, y), top)
        await page.waitForTimeout(320)

        const worst = await page.locator(id).evaluate((section) => {
          const nodes = section.querySelectorAll<HTMLElement>('h1, h2, h3, p, li, .label')
          let min = Number.POSITIVE_INFINITY
          for (const el of nodes) {
            const r = el.getBoundingClientRect()
            if (r.height > 0 && (el.textContent ?? '').trim() && r.bottom > 0) {
              min = Math.min(min, r.top)
            }
          }
          return Number.isFinite(min) ? Math.round(min) : null
        })

        if (worst !== null) {
          expect(worst, `${id}: texto começa em y=${worst}, dentro da faixa do nav`).toBeGreaterThanOrEqual(
            NAV_H - 4,
          )
        }
      }
    })
  })
}
