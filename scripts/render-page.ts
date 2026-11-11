// Renders one page the way the UX review sees it (quality-review.md, 9.2) and saves what it saw:
//   desktop-light   1280x800, light theme, apps as built
//   phone-dark      390x844, dark theme, apps as built
//   no-apps         390x844, light theme, every app control hidden and every "Connect {app}" line shown
// For each view it writes {view}.png (the whole page) and {view}-first.png (the first screen), and
// render.json with what a screenshot cannot show: page height, sideways scroll, where the first task
// sits, controls under the minimum tap size, and what every button did when it was pressed. That folder
// is the `render` input the review takes when its caller rendered the page (CI and the page eval).
//
// This script lives in the repository only: the plugin ships no script files (CLAUDE.md). With no page
// named it renders the fixture in scripts/fixtures/render-page/ and checks what the fixture is built to
// show, so CI proves the renderer works before the eval relies on it.
//
//   bun scripts/render-page.ts                       # the fixture, into a temporary folder
//   bun scripts/render-page.ts page.html --out dir   # any page; prints the first task's depth per view
//
// Exit 0 when it rendered (and, for the fixture, every check held), 1 when a fixture check failed or the
// render broke, 2 on bad arguments or a missing page, and 3 when Playwright or Chromium is not installed
// (npm install --no-save playwright, then npx playwright install chromium).
// The page runs in Chromium with no network except the hosts a published page may load from, and it can
// load no file on this machine except itself.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const VIEWS = [
  { id: 'desktop-light', width: 1280, height: 800, theme: 'light', apps: 'as-built', touch: false },
  { id: 'phone-dark', width: 390, height: 844, theme: 'dark', apps: 'as-built', touch: true },
  { id: 'no-apps', width: 390, height: 844, theme: 'light', apps: 'none', touch: true },
] as const
type View = (typeof VIEWS)[number]

// The hosts a published page may load scripts, styles and fonts from (artifact-standard.md).
const ALLOWED_HOSTS = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'unpkg.com', 'cdn.tailwindcss.com',
  'code.jquery.com', 'fonts.googleapis.com', 'fonts.gstatic.com']

// The first task: a step the page marks, else its first decision, else its first next step. A page with
// none of that markup falls back to a steps anchor, then to the first heading that names the steps.
const FIRST_TASK = ['[data-first-task]', '[data-page="decisions"] [data-decision]',
  '[data-page="next-steps"] li', '[data-page="next-steps"] [data-step]', '[data-page="next-steps"]',
  '#next-steps', '#steps']
const STEPS_HEADING = '(next|first) steps?|what to do (first|now|next)'

const CONTROLS = 'button, [role="button"], summary, input[type="button"], input[type="submit"], a[data-action]'

function loadPlaywright(): any {
  const from = (dir: string) => createRequire(join(dir, 'x.js'))('playwright')
  const tries: Array<() => any> = [
    () => from(dirname(fileURLToPath(import.meta.url))),
    () => from(process.cwd()),
    // Only when neither folder has it: a machine with Playwright installed globally.
    () => from(execFileSync('npm', ['root', '-g'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()),
  ]
  for (const attempt of tries) {
    try { return attempt() } catch {}
  }
  return null
}

async function launch(playwright: any) {
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
function measure([firstTask, stepsHeading, controls, touch]: [string[], string, string, boolean]) {
  const doc = document.documentElement
  const visible = (el: Element) => {
    const box = el.getBoundingClientRect()
    const style = getComputedStyle(el)
    return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
  }
  const label = (el: any) => (el.getAttribute('aria-label') || el.innerText || el.value || '').replace(/\s+/g, ' ').trim().slice(0, 80)
  const at = (selector: string, el: Element) => {
    const top = Math.round(el.getBoundingClientRect().top + window.scrollY)
    return { selector, text: label(el), top, screens: Math.round((top / window.innerHeight) * 10) / 10 }
  }
  let task = null
  for (const selector of firstTask) {
    const el = [...document.querySelectorAll(selector)].find(visible)
    if (el) { task = at(selector, el); break }
  }
  if (!task) {
    const pattern = new RegExp(stepsHeading, 'i')
    const heading = [...document.querySelectorAll('h1, h2, h3, h4')].find(el => visible(el) && pattern.test((el as HTMLElement).innerText))
    if (heading) task = at('heading', heading)
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

async function openView(browser: any, url: string, view: View) {
  const context = await browser.newContext({
    viewport: { width: view.width, height: view.height },
    colorScheme: view.theme,
    hasTouch: view.touch,
    isMobile: view.touch,
    deviceScaleFactor: 1,
  })
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {})
  const blocked: string[] = []
  await context.route('**/*', (route: any) => {
    const target = new URL(route.request().url())
    // The page's own file and inline data only: any other file: URL could put a local file in a screenshot.
    const own = target.protocol === 'file:' && target.href.split(/[?#]/)[0] === url
    if (own || target.protocol === 'data:' || target.protocol === 'blob:' || ALLOWED_HOSTS.includes(target.hostname)) return route.continue()
    blocked.push(target.href.slice(0, 200))
    return route.abort()
  })
  const page = await context.newPage()
  const errors: string[] = []
  page.on('pageerror', (error: any) => errors.push(String(error?.message ?? error)))
  page.on('console', (message: any) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('dialog', (dialog: any) => dialog.dismiss().catch(() => {}))
  await page.goto(url, { waitUntil: 'load' })
  await prepare(page, view)
  return { context, page, errors, blocked }
}

async function prepare(page: any, view: View) {
  await page.evaluate((theme: string) => {
    // A page that keys dark mode off data-theme rather than the media query gets it too, unless it fixed a theme.
    if (!document.documentElement.hasAttribute('data-theme')) document.documentElement.setAttribute('data-theme', theme)
  }, view.theme)
  if (view.apps === 'none') {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-apps', 'none')
      // A Connect line may be hidden by the hidden attribute or by the page's own rule; show it either way.
      for (const line of document.querySelectorAll('[data-app-missing]')) {
        line.removeAttribute('hidden')
        if (getComputedStyle(line).display === 'none') (line as HTMLElement).style.setProperty('display', 'block', 'important')
      }
      for (const control of document.querySelectorAll('[data-app]')) (control as HTMLElement).style.setProperty('display', 'none', 'important')
    })
  }
  await page.evaluate(() => document.fonts?.ready).catch(() => {})
  await page.waitForTimeout(300)
}

// A cheap fingerprint of what the reader can see change: the body's markup, the hash, and open dialogs.
const fingerprint = () => {
  let h = 2166136261
  const text = document.body.innerHTML + '|' + location.href + '|' + document.querySelectorAll('dialog[open], [aria-expanded="true"]').length
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

// Presses every control once, folded steps included, and records what each did. Every <details> is opened
// first so the buttons inside folded steps are reachable; controls are tagged up front so a press that adds
// or removes markup does not shift which control comes next, and controls a press reveals get one more round.
async function pressEveryButton(page: any, url: string, view: View, errors: string[]) {
  const results: any[] = []
  const tag = () => page.evaluate((controls: string) => {
    for (const details of document.querySelectorAll('details')) (details as HTMLDetailsElement).open = true
    const fresh: string[] = []
    let n = document.querySelectorAll('[data-render-id]').length
    for (const el of document.querySelectorAll(controls)) {
      if (el.hasAttribute('data-render-id')) continue
      el.setAttribute('data-render-id', String(n))
      fresh.push(String(n++))
    }
    return fresh
  }, CONTROLS)
  const done = new Set<string>()
  for (let round = 0; round < 2; round++) {
    const ids: string[] = await tag().catch(() => [])
    for (const id of ids) {
      if (done.has(id)) continue
      done.add(id)
      // A pressed <summary> closes its section again, so every section is reopened before each press.
      await page.evaluate(() => { for (const details of document.querySelectorAll('details')) (details as HTMLDetailsElement).open = true }).catch(() => {})
      const control = page.locator(`[data-render-id="${id}"]`)
      if (!(await control.count().catch(() => 0))) continue
      const label = ((await control.getAttribute('aria-label').catch(() => null)) || (await control.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim().slice(0, 80)
      if (!(await control.isVisible().catch(() => false))) {
        results.push({ label, pressed: false, why: 'hidden', changedPage: false, copied: null, errors: [] })
        continue
      }
      const errorCount = errors.length
      try {
        const before = await page.evaluate(fingerprint)
        await page.evaluate(() => navigator.clipboard?.writeText('').catch(() => {})).catch(() => {})
        let pressed = true
        await control.click({ timeout: 2000, noWaitAfter: true }).catch(() => { pressed = false })
        await page.waitForTimeout(150)
        const navigated = page.url().split('#')[0] !== url
        const after = navigated ? -1 : await page.evaluate(fingerprint)
        const copied = navigated ? '' : await page.evaluate(() => navigator.clipboard ? navigator.clipboard.readText().catch(() => '') : '').catch(() => '')
        results.push({ label, pressed, ...(navigated ? { navigated: page.url().slice(0, 200) } : {}), changedPage: before !== after, copied: copied ? copied.slice(0, 200) : null, errors: errors.slice(errorCount) })
        if (navigated) throw new Error('navigated')
      } catch (error: any) {
        // A press that left the page (a form submit, a link) or reloaded it: record it, come back, and go on.
        if (String(error?.message) !== 'navigated') results.push({ label, pressed: true, changedPage: true, copied: null, errors: [...errors.slice(errorCount), `the page reloaded or left: ${String(error?.message ?? error).split('\n')[0]}`] })
        await page.goto(url, { waitUntil: 'load' }).catch(() => {})
        await prepare(page, view)
        await tag().catch(() => [])
      }
    }
  }
  return results
}

export async function renderPage(file: string, outDir: string): Promise<{ status: number; report: any }> {
  const playwright = loadPlaywright()
  if (!playwright) return { status: 3, report: { rendered: false, why: 'Playwright is not installed' } }
  const path = resolve(file)
  if (!existsSync(path)) return { status: 2, report: { rendered: false, why: `no page at ${path}` } }
  mkdirSync(outDir, { recursive: true })
  let browser: any
  try {
    browser = await launch(playwright)
  } catch (error: any) {
    return { status: 3, report: { rendered: false, why: `Chromium did not start: ${String(error?.message ?? error).split('\n')[0]}` } }
  }
  const url = pathToFileURL(path).href
  const report: any = { rendered: true, page: basename(path), renderer: 'playwright', views: [] }
  try {
    for (const view of VIEWS) {
      const { context, page, errors, blocked } = await openView(browser, url, view)
      const shots = { page: join(outDir, `${view.id}.png`), firstScreen: join(outDir, `${view.id}-first.png`) }
      await page.screenshot({ path: shots.firstScreen })
      await page.screenshot({ path: shots.page, fullPage: true })
      const measured = await page.evaluate(measure, [FIRST_TASK, STEPS_HEADING, CONTROLS, view.touch])
      // The buttons are pressed in the desktop view, after its screenshots, so no shot shows a pressed state.
      const buttons = view.id === 'desktop-light' ? await pressEveryButton(page, url, view, errors) : undefined
      report.views.push({ ...view, ...measured, shots, ...(buttons ? { buttons } : {}), errors: [...errors], blockedRequests: blocked })
      await context.close()
    }
  } catch (error: any) {
    return { status: 1, report: { rendered: false, why: `the render broke: ${String(error?.message ?? error).split('\n')[0]}` } }
  } finally {
    await browser.close()
  }
  writeFileSync(join(outDir, 'render.json'), JSON.stringify(report, null, 2) + '\n')
  return { status: 0, report }
}

// What the fixture is built to show: each line is a property the UX review reads from render.json.
function checkFixture(report: any): string[] {
  const problems: string[] = []
  const [desktop, phone, noApps] = report.views
  const press = (label: string) => desktop.buttons.find((button: any) => button.label === label)
  if (phone.width !== 390 || phone.theme !== 'dark') problems.push('the phone view is not 390 wide and dark')
  if (desktop.width !== 1280 || desktop.height !== 800 || desktop.theme !== 'light') problems.push('the desktop view is not 1280x800 and light')
  if (phone.firstTask?.selector !== '[data-first-task]') problems.push('the first task was not found on the phone')
  if (phone.sidewaysScroll) problems.push('the fixture scrolls sideways on the phone')
  if (!phone.apps.controls.some((control: any) => control.app === 'gmail')) problems.push('the Gmail button is missing from the view with apps as built')
  if (noApps.apps.controls.length) problems.push('the no-apps view still shows an app button')
  if (!noApps.apps.connectLines.some((line: any) => line.app === 'gmail')) problems.push('the no-apps view does not show the "Connect Gmail" line, which the page hides with the hidden attribute')
  if (press('Copy offer')?.copied !== 'Hi, we would love you to post about our holiday gift set before Black Friday.') problems.push('pressing "Copy offer" did not report what it copied')
  if (press('Send from Gmail')?.changedPage !== false) problems.push('the Gmail button does nothing, and the renderer did not report it')
  if (press('Copy terms')?.pressed !== true) problems.push('"Copy terms", inside a folded step, was not pressed')
  if (!press('Reload')?.navigated && !press('Reload')?.errors?.length) problems.push('the button that leaves the page was not reported')
  if (press('Copy tracking note')?.pressed !== true) problems.push('the control after the one that leaves the page was not pressed')
  if (!desktop.smallControls.controls.some((control: any) => control.label === 'Show the terms')) problems.push('the 24px "Show the terms" control was not reported as under 36px')
  if (!desktop.blockedRequests.some((request: string) => request.startsWith('file:'))) problems.push('the frame of another local file was not blocked')
  return problems
}

if (import.meta.main) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const fixture = join(root, 'scripts/fixtures/render-page/page.html')
  const args = process.argv.slice(2)
  const outAt = args.indexOf('--out')
  const pages = args.filter((arg, i) => arg !== '--out' && (outAt === -1 || i !== outAt + 1))
  if (pages.length > 1 || (outAt !== -1 && !args[outAt + 1])) {
    console.error('usage: bun scripts/render-page.ts [page.html] [--out dir]')
    process.exit(2)
  }
  const page = pages[0] ? resolve(pages[0]) : fixture
  const out = outAt !== -1 ? resolve(args[outAt + 1]) : mkdtempSync(join(tmpdir(), 'render-page-'))
  const { status, report } = await renderPage(page, out)
  if (status !== 0) {
    console.error(`FAIL the renderer did not render ${page}: ${report.why}`)
    process.exit(status)
  }
  const problems: string[] = []
  for (const view of report.views) {
    for (const shot of [view.shots.page, view.shots.firstScreen]) {
      if (!existsSync(shot) || statSync(shot).size < 1000) problems.push(`${view.id}: no screenshot at ${shot}`)
    }
    const task = view.firstTask ? `first task at ${view.firstTask.top}px (${view.firstTask.screens} screens)` : 'no first task marked'
    console.log(`${view.id.padEnd(14)} ${String(view.pageHeight).padStart(6)}px tall, ${task}${view.sidewaysScroll ? ', scrolls sideways' : ''}`)
  }
  if (page === fixture) problems.push(...checkFixture(report))
  console.log(`screenshots and render.json in ${out}`)
  for (const problem of problems) console.error(`FAIL ${problem}`)
  process.exit(problems.length ? 1 : 0)
}
