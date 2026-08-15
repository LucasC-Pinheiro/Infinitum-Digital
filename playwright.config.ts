import { defineConfig, devices } from '@playwright/test'

/**
 * Suíte de QA das duas adições (abertura de primeira visita + seção
 * horizontal) e da varredura de compatibilidade. Roda contra o servidor de
 * dev do Vite — o mesmo comportamento funcional da build de produção, sem o
 * custo de rebuildar a cada execução. A comparação de Lighthouse (que precisa
 * da build real) roda à parte, via `npm run build && npx vite preview`.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
})
