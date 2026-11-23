// Holds the page check's length estimate (R10, page-check.md) to the page as Chromium draws it.
//
// The page check has no browser, so it estimates how tall a template page is from the top to the end
// of its decisions, from the fill script's layout. This script fills every template's example
// (scripts/fixtures/page-templates/<template>.json) and every page in scripts/fixtures/page-length/,
// draws each at 1280 by 800 with its fonts loaded, and fails when an estimate is more than
// TOLERANCE off the drawn height. A change to the block style or the fill script's layout that moves
// a page's height shows up here, and the estimate's constants in page-check.md change with it.
//
// This script lives in the repository only: the plugin ships no script files (CLAUDE.md).
//
//   bun scripts/check-page-length.ts
//
// Exit 0 when every estimate is within TOLERANCE, 1 when one is not or a page did not fill, and 3 when
// Playwright or Chromium is not installed (as scripts/render-page.ts says).
import { copyFileSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { launch, loadPlaywright } from './render-page.ts'

const TOLERANCE = 0.08
const ROOT = join(import.meta.dir, '..')
const PS = join(ROOT, 'plugins/aspire/skills/page-standard')
const SUPPORT = [
  join(PS, 'page-data.schema.json'), join(PS, 'page-templates.json'), join(PS, 'page-check.md'), join(PS, 'glossary.md'),
  join(PS, 'blocks.md'), join(ROOT, 'plugins/aspire/skills/aspire/references/artifact-standard.md'),
  join(ROOT, 'plugins/aspire/assets/aspire-animated.svg.md'),
]

/** The fenced script between <!-- name --> and <!-- /name -->, cut the way the skill tells agents to cut it. */
function snippet(markdown: string, name: string): string {
  const lines = markdown.split('\n')
  const from = lines.indexOf(`<!-- ${name} -->`)
  const to = lines.indexOf(`<!-- /${name} -->`)
  if (from === -1 || to - from < 4) throw new Error(`no ${name} script`)
  return lines.slice(from + 2, to - 1).join('\n') + '\n'
}

function python(args: string[]): { code: number; out: string } {
  const run = Bun.spawnSync(['python3', '-I', ...args])
  return { code: run.exitCode, out: run.stdout.toString() }
}

const dir = mkdtempSync(join(tmpdir(), 'page-length-'))
for (const file of SUPPORT) copyFileSync(file, join(dir, file.split('/').pop()!))
writeFileSync(join(dir, 'page_fill.py'), snippet(readFileSync(join(PS, 'page-fill.md'), 'utf8'), 'page-fill'))
writeFileSync(join(dir, 'page_check.py'), snippet(readFileSync(join(PS, 'page-check.md'), 'utf8'), 'page-check'))

const templates = Object.keys(JSON.parse(readFileSync(join(PS, 'page-templates.json'), 'utf8')).templates)
const pages = [
  ...templates.map(t => join(ROOT, 'scripts/fixtures/page-templates', `${t}.json`)),
  ...readdirSync(join(ROOT, 'scripts/fixtures/page-length')).filter(f => f.endsWith('.json')).sort()
    .map(f => join(ROOT, 'scripts/fixtures/page-length', f)),
]

const playwright = loadPlaywright()
if (!playwright) {
  console.log('SKIP page length: Playwright is not installed (npm install --no-save playwright)')
  process.exit(3)
}
let browser: any
try {
  browser = await launch(playwright)
} catch (error) {
  console.log(`SKIP page length: no Chromium to draw with (${(error as Error).message.split('\n')[0]})`)
  process.exit(3)
}

let failed = 0
const view = await browser.newPage({ viewport: { width: 1280, height: 800 } })
for (const data of pages) {
  const name = data.slice(ROOT.length + 1)
  copyFileSync(data, join(dir, 'page.json'))
  const filled = python([join(dir, 'page_fill.py'), join(dir, 'page.json')])
  if (filled.code !== 0) {
    console.log(`FAIL ${name} did not fill (exit ${filled.code}): ${filled.out.slice(0, 400)}`)
    failed++
    continue
  }
  const html = join(dir, 'page.html')
  writeFileSync(html, filled.out)
  const checked = python([join(dir, 'page_check.py'), html]).out.split('\n').filter(Boolean).map(line => JSON.parse(line))
  const estimate = checked.find(line => line.check === 'R10')?.length?.height
  await view.goto(`file://${html}`, { waitUntil: 'networkidle' }).catch(() => view.goto(`file://${html}`))
  const drawn = await view.evaluate(async () => {
    await document.fonts.ready
    return document.querySelector('[data-page="decisions"]')?.getBoundingClientRect().bottom ?? null
  })
  if (typeof estimate !== 'number' || typeof drawn !== 'number') {
    console.log(`FAIL ${name}: no estimate (${estimate}) or no decisions section drawn (${drawn})`)
    failed++
    continue
  }
  const off = (estimate - drawn) / drawn
  const line = `${name}: estimated ${estimate}px, drawn ${Math.round(drawn)}px (${off >= 0 ? '+' : ''}${(off * 100).toFixed(1)}%)`
  if (Math.abs(off) > TOLERANCE) {
    console.log(`FAIL ${line}, more than ${TOLERANCE * 100}% off: change the estimate's constants in page-check.md`)
    failed++
  } else {
    console.log(`ok   ${line}`)
  }
}
await browser.close()
if (!failed) console.log(`OK   page length: the page check's estimate is within ${TOLERANCE * 100}% of the drawn height on ${pages.length} pages`)
process.exit(failed ? 1 : 0)
