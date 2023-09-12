import { test, expect, _electron as electron, type ElementHandle } from '@playwright/test'
import type { WebviewTag } from 'electron'

test('homepage has webview showing bondage club', async () => {
  const app = await electron.launch({ args: ['.', '--no-sandbox'] })
  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await new Promise((resolve) => setTimeout(resolve, 3000))
  const webview = (await page.$('webview')) as ElementHandle<WebviewTag>
  expect(await webview.getAttribute('src')).toMatch(/\/BondageClub\//)
  await page.screenshot({ path: 'e2e/screenshots/homepage.png' })
  await webview.screenshot({ path: 'e2e/screenshots/webview.png' })
})
