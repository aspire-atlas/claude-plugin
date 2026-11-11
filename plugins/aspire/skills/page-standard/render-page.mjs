// Renders one page the way the UX review (ux-review.md) sees it, and saves what it saw:
//   desktop-light   1280x800, light theme, apps as built
//   phone-dark      390x844, dark theme, apps as built
//   no-apps         390x844, light theme, every app control hidden and every "Connect {app}" line shown
// For each view it writes {view}.png (the whole page) and {view}-first.png (the first screen), and
// render.json with what a screenshot cannot show: page height, sideways scroll, where the first task
// sits, controls under the minimum tap size, and what every button did when it was pressed.
//
//   node render-page.mjs page.html [--out dir]
//
// Exit 0 when all three views rendered, 2 when the page could not be read, and 3 when no renderer is
// installed (Playwright with Chromium). On 3 the review judges by source order and reports
// rendered: false. The page runs in Chromium with no network except the hosts a published page may
// load from, and nothing on the page can reach this machine's files.
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const VIEWS = [
  { id: 'desktop-light', width: 1280, height: 800, theme: 'light', apps: 'as-built', touch: false },
  { id: 'phone-dark', width: 390, height: 844, theme: 'dark', apps: 'as-built', touch: true },
  { id: 'no-apps', width: 390, height: 844, theme: 'light', apps: 'none', touch: true },
]

// The hosts a published page may load scripts, styles and fonts from (artifact-standard.md).
const ALLOWED_HOSTS = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'unpkg.com', 'cdn.tailwindcss.com',
  'code.jquery.com', 'fonts.googleapis.com', 'fonts.gstatic.com']

// What the no-apps view does to a page: every control that needs an app is hidden, and every line
// that offers to connect one is shown (blocks.md, "Apps never assumed").
const NO_APPS_CSS = '[data-app]{display:none!important}[data-app-missing]{display:revert!important}'

// The first task: a step the page marks, else its first decision, else its first next step. A page with
// none of that markup falls back to a steps anchor, then to the first heading that names the steps.
const FIRST_TASK = ['[data-first-task]', '[data-page="decisions"] [data-decision]',
  '[data-page="next-steps"] li', '[data-page="next-steps"] [data-step]', '[data-page="next-steps"]',
  '#next-steps', '#steps']
const STEPS_HEADING = '(next|first) steps?|what to do (first|now|next)'

const CONTROLS = 'button, [role="button"], summary, input[type="button"], input[type="submit"], a[data-action]'

function loadPlaywright() {
  const tries = [() => createRequire(import.meta.url)('playwright'), () => createRequire(join(process.cwd(), 'x.js'))('playwright')]
  try {
    const root = execFileSync('npm', ['root', '-g'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    tries.push(() => createRequire(join(root, 'x.js'))('playwright'))
  } catch {}
  for (const attempt of tries) {
    try { return attempt() } catch {}
  }
  return null
}

async function launch(playwright) {
  try {
    return await playwright.chromium.launch()
  } catch (first) {
    // A machine with Chromium installed outside Playwright's own folder.
    for (const path of ['/opt/pw-browsers/chromium', process.env.CHROME_PATH].filter(Boolean)) {
      try { return await playwright.chromium.launch({ executablePath: path, args: ['--no-sandbox'] }) } catch {}
    }
    throw first
  }
}

// Runs in the page: everything render.json reports about one view.
function measure([firstTask, stepsHeading, controls, touch]) {
  const doc = document.documentElement
  const visible = el => {
    const box = el.getBoundingClientRect()
    const style = getComputedStyle(el)
    return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
  }
  const label = el => (el.getAttribute('aria-label') || el.innerText || el.value || '').replace(/\s+/g, ' ').trim().slice(0, 80)
  let task = null
  for (const selector of firstTask) {
    const el = [...document.querySelectorAll(selector)].find(visible)
    if (el) {
      const top = Math.round(el.getBoundingClientRect().top + window.scrollY)
      task = { selector, text: label(el).slice(0, 80), top, screens: Math.round((top / window.innerHeight) * 10) / 10 }
      break
    }
  }
  if (!task) {
    const heading = [...document.querySelectorAll('h1, h2, h3, h4')].find(el => visible(el) && new RegExp(stepsHeading, 'i').test(el.innerText))
    if (heading) {
      const top = Math.round(heading.getBoundingClientRect().top + window.scrollY)
      task = { selector: 'heading', text: label(heading), top, screens: Math.round((top / window.innerHeight) * 10) / 10 }
    }
  }
  const min = touch ? 44 : 36
  const small = [...document.querySelectorAll(controls)].filter(visible)
    .map(el => ({ label: label(el), height: Math.round(el.getBoundingClientRect().height) }))
    .filter(control => control.height < min)
  return {
    pageHeight: Math.round(doc.scrollHeight),
    sidewaysScroll: doc.scrollWidth > doc.clientWidth + 1,
    firstTask: task,
    smallControls: { min, controls: small },
    apps: {
      controls: [...document.querySelectorAll('[data-app]')].filter(visible).map(el => ({ app: el.getAttribute('data-app'), label: label(el) })),
      connectLines: [...document.querySelectorAll('[data-app-missing]')].filter(visible).map(el => ({ app: el.getAttribute('data-app-missing'), text: label(el) })),
    },
  }
}

async function openView(browser, url, view) {
  const context = await browser.newContext({
    viewport: { width: view.width, height: view.height },
    colorScheme: view.theme,
    hasTouch: view.touch,
    isMobile: view.touch,
    deviceScaleFactor: 1,
  })
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {})
  const blocked = []
  await context.route('**/*', route => {
    const target = new URL(route.request().url())
    if (target.protocol === 'file:' || target.protocol === 'data:' || target.protocol === 'blob:' || ALLOWED_HOSTS.includes(target.hostname)) return route.continue()
    blocked.push(target.href.slice(0, 200))
    return route.abort()
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(String(error.message || error)))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('dialog', dialog => dialog.dismiss().catch(() => {}))
  await page.goto(url, { waitUntil: 'load' })
  await page.evaluate(theme => {
    // A page that keys dark mode off data-theme rather than the media query gets it too, unless it fixed a theme.
    if (!document.documentElement.hasAttribute('data-theme')) document.documentElement.setAttribute('data-theme', theme)
  }, view.theme)
  if (view.apps === 'none') {
    await page.evaluate(css => {
      document.documentElement.setAttribute('data-apps', 'none')
      const style = document.createElement('style')
      style.textContent = css
      document.head.append(style)
    }, NO_APPS_CSS)
  }
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {})
  await page.waitForTimeout(300)
  return { context, page, errors, blocked }
}

// Presses every visible control once, in page order, and records what each did.
async function pressEveryButton(page, errors) {
  const count = await page.locator(CONTROLS).count()
  const results = []
  for (let i = 0; i < count; i++) {
    const control = page.locator(CONTROLS).nth(i)
    if (!(await control.isVisible().catch(() => false))) continue
    const label = ((await control.getAttribute('aria-label').catch(() => null)) || (await control.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim().slice(0, 80)
    const before = await page.evaluate(() => document.body.innerHTML + '|' + location.hash + '|' + document.querySelectorAll('dialog[open], [aria-expanded="true"]').length)
    await page.evaluate(() => navigator.clipboard && navigator.clipboard.writeText('').catch(() => {})).catch(() => {})
    const errorCount = errors.length
    let pressed = true
    await control.click({ timeout: 2000, trial: false, noWaitAfter: true }).catch(() => { pressed = false })
    await page.waitForTimeout(150)
    const after = await page.evaluate(() => document.body.innerHTML + '|' + location.hash + '|' + document.querySelectorAll('dialog[open], [aria-expanded="true"]').length)
    const copied = await page.evaluate(() => navigator.clipboard ? navigator.clipboard.readText().catch(() => '') : '').catch(() => '')
    results.push({
      label,
      pressed,
      changedPage: before !== after,
      copied: copied ? copied.slice(0, 200) : null,
      errors: errors.slice(errorCount),
    })
  }
  return results
}

export async function renderPage(file, outDir) {
  const playwright = loadPlaywright()
  if (!playwright) return { status: 3, report: { rendered: false, why: 'Playwright is not installed' } }
  const path = resolve(file)
  if (!existsSync(path)) return { status: 2, report: { rendered: false, why: `no page at ${path}` } }
  mkdirSync(outDir, { recursive: true })
  let browser
  try {
    browser = await launch(playwright)
  } catch (error) {
    return { status: 3, report: { rendered: false, why: `Chromium did not start: ${String(error.message || error).split('\n')[0]}` } }
  }
  const report = { rendered: true, page: basename(path), renderer: 'playwright', views: [] }
  try {
    for (const view of VIEWS) {
      const { context, page, errors, blocked } = await openView(browser, pathToFileURL(path).href, view)
      const shots = { page: join(outDir, `${view.id}.png`), firstScreen: join(outDir, `${view.id}-first.png`) }
      await page.screenshot({ path: shots.firstScreen })
      await page.screenshot({ path: shots.page, fullPage: true })
      const measured = await page.evaluate(measure, [FIRST_TASK, STEPS_HEADING, CONTROLS, view.touch])
      // The buttons are pressed in the desktop view, after its screenshots, so no shot shows a pressed state.
      const buttons = view.id === 'desktop-light' ? await pressEveryButton(page, errors) : undefined
      report.views.push({ ...view, ...measured, shots, ...(buttons ? { buttons } : {}), errors: [...errors], blockedRequests: blocked })
      await context.close()
    }
  } finally {
    await browser.close()
  }
  writeFileSync(join(outDir, 'render.json'), JSON.stringify(report, null, 2) + '\n')
  return { status: 0, report }
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)
if (invokedDirectly) {
  const args = process.argv.slice(2)
  const outAt = args.indexOf('--out')
  const out = outAt === -1 ? null : args[outAt + 1]
  const pages = args.filter((arg, i) => arg !== '--out' && (outAt === -1 || i !== outAt + 1))
  if (pages.length !== 1 || (outAt !== -1 && !out)) {
    console.error('usage: node render-page.mjs page.html [--out dir]')
    process.exit(2)
  }
  const dir = resolve(out || join(process.cwd(), `render-${basename(pages[0]).replace(/\.html?$/i, '')}`))
  const { status, report } = await renderPage(pages[0], dir)
  if (status === 0) {
    console.log(JSON.stringify({ rendered: true, out: dir, views: report.views.map(v => ({ id: v.id, pageHeight: v.pageHeight, firstTaskTop: v.firstTask ? v.firstTask.top : null, sidewaysScroll: v.sidewaysScroll, errors: v.errors.length })) }))
  } else {
    console.log(JSON.stringify(report))
  }
  process.exit(status)
}
