// Renders a page with the UX review's renderer (plugins/aspire/skills/page-standard/render-page.mjs) and
// checks that it saw what the review needs: the three views, a whole-page and a first-screen shot of each,
// and render.json. With no page named it renders the fixture in scripts/fixtures/render-page/ and also
// checks what the fixture is built to show, so CI proves the renderer works before a reviewer relies on it.
//
//   bun scripts/render-page.ts                       # the fixture, into a temporary folder
//   bun scripts/render-page.ts page.html --out dir   # any page; prints the first task's depth per view
//
// Needs Playwright with Chromium (npm install --no-save playwright, then npx playwright install chromium).
import { existsSync, mkdtempSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
// @ts-ignore: a plain ESM file shipped in the plugin, with no type declarations
import { renderPage, VIEWS } from '../plugins/aspire/skills/page-standard/render-page.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FIXTURE = join(root, 'scripts/fixtures/render-page/page.html')

const args = process.argv.slice(2)
const outAt = args.indexOf('--out')
const pages = args.filter((arg, i) => arg !== '--out' && (outAt === -1 || i !== outAt + 1))
const page = pages[0] ? resolve(pages[0]) : FIXTURE
const out = outAt !== -1 && args[outAt + 1] ? resolve(args[outAt + 1]) : mkdtempSync(join(tmpdir(), 'render-page-'))

const problems: string[] = []
const { status, report } = await renderPage(page, out)
if (status !== 0) {
  console.error(`FAIL the renderer did not render ${page}: ${report.why}`)
  process.exit(1)
}

const ids = report.views.map((view: any) => view.id)
const expected = VIEWS.map((view: any) => view.id)
if (ids.join() !== expected.join()) problems.push(`views were ${ids.join(', ')}, expected ${expected.join(', ')}`)
for (const view of report.views) {
  for (const shot of [view.shots.page, view.shots.firstScreen]) {
    if (!existsSync(shot) || statSync(shot).size < 1000) problems.push(`${view.id}: no screenshot at ${shot}`)
  }
  if (view.errors.length) problems.push(`${view.id}: the page threw: ${view.errors.join('; ')}`)
}
if (!existsSync(join(out, 'render.json'))) problems.push('no render.json')

if (page === FIXTURE) {
  // What the fixture is built to show: each line here is a property the UX review reads from render.json.
  const [desktop, phone, noApps] = report.views
  if (phone.width !== 390 || phone.theme !== 'dark') problems.push('the phone view is not 390 wide and dark')
  if (desktop.width !== 1280 || desktop.height !== 800 || desktop.theme !== 'light') problems.push('the desktop view is not 1280x800 and light')
  if (!phone.firstTask || phone.firstTask.selector !== '[data-first-task]') problems.push('the first task was not found on the phone')
  if (phone.sidewaysScroll) problems.push('the fixture scrolls sideways on the phone')
  if (!phone.apps.controls.some((control: any) => control.app === 'gmail')) problems.push('the Gmail button is missing from the view with apps as built')
  if (noApps.apps.controls.length) problems.push('the no-apps view still shows an app button')
  if (!noApps.apps.connectLines.some((line: any) => line.app === 'gmail')) problems.push('the no-apps view does not show the "Connect Gmail" line')
  const press = (label: string) => desktop.buttons.find((button: any) => button.label === label)
  if (press('Copy offer')?.copied !== 'Hi, we would love you to post about our holiday gift set before Black Friday.') problems.push('pressing "Copy offer" did not report what it copied')
  if (press('Send from Gmail')?.changedPage !== false) problems.push('the Gmail button does nothing, and the renderer did not report it')
  if (!desktop.smallControls.controls.some((control: any) => control.label === 'Show the method')) problems.push('the 24px "Show the method" control was not reported as under 36px')
}

for (const view of report.views) {
  const task = view.firstTask ? `first task at ${view.firstTask.top}px (${view.firstTask.screens} screens)` : 'no first task marked'
  console.log(`${view.id.padEnd(14)} ${String(view.pageHeight).padStart(6)}px tall, ${task}${view.sidewaysScroll ? ', scrolls sideways' : ''}`)
}
console.log(`screenshots and render.json in ${out}`)
if (problems.length) {
  for (const problem of problems) console.error(`FAIL ${problem}`)
  process.exit(1)
}
console.log('ok')
