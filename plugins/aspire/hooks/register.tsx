// The Aspire mod: a progress bar and a band above the prompt, and an agents
// panel, for Claude Code.
//
// It stays inert until an Aspire event: a prompt typed as /aspire or
// /aspire:aspire, the aspire skill's prompt being expanded or run through the
// Skill tool, the skill reporting progress, an Atlas connector tool answering,
// or an aspire:* agent starting. Before that every hook passes the event
// straight on and records nothing. After that it reads what already passes
// through the session (Atlas get_status results, subagent starts and ends,
// model response timing, the context fill) and draws it. It registers one tool,
// aspire_progress, that the aspire skill calls to move the bar; the tool only
// updates what the bar shows. It makes no network calls, starts no processes,
// reads and writes no files, and changes no tool call, prompt, or agent.
//
// Several triggers, because one is not enough everywhere: in sessions the
// Claude desktop app starts, Claude Code's built-in security plugin passes
// skill.prompt over the plugins a person installs, so a typed /aspire is seen
// there only as the prompt itself.
//
// Early-access API (function hooks): written and tested on Claude Code 2.1.295 and 2.1.299.
//
// The bar, the band and the panel are adapted from two mods in claude-kit,
// https://github.com/johnnyvizz/claude-kit: savvy-progress (the progress bar and
// the agents panel) and session-band (the band), used under the MIT License:
//
//   MIT License
//
//   Copyright (c) 2026 johnnyvizz
//
//   Permission is hereby granted, free of charge, to any person obtaining a copy
//   of this software and associated documentation files (the "Software"), to deal
//   in the Software without restriction, including without limitation the rights
//   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//   copies of the Software, and to permit persons to whom the Software is
//   furnished to do so, subject to the following conditions:
//
//   The above copyright notice and this permission notice shall be included in all
//   copies or substantial portions of the Software.
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//   SOFTWARE.
//
// What changed from the kit: the bar reports the aspire skill (the
// aspire_progress tool, or a baseline from Atlas get_status before the skill
// reports) instead of savvy-flow, with the organization's name as its title
// and no planned-task layer; the band's cost shows Atlas token costs from
// get_status (./atlas-usage.ts) instead of Claude's own cost; the cache
// countdown and its warning notifications (a helper app, Claude Code's push notification, the desktop
// session file read) are gone; the panel drops savvy-flow's plan, its step
// tool, the Claude price table and every cost figure, and its Russian and
// Hebrew strings (English only); the characters moved to ./characters.ts.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { AgentRun, AtlasReading, BandStats, OrgState, Panel, Progress, Seen, Trigger, TriggerKind } from '../types'
import { ATLAS_ABSENT, ATLAS_ABSENT_HINT, fmtAtlasUsage, isAtlasStatusCall, isAtlasToolName, readAtlasOrg, readAtlasUsage } from './atlas-usage'
import { ASPIRE, CRAB_CSS, characterOf, crab } from './characters'
import { GROUPS, ROSTER } from './roster'
import type { RosterEntry } from './roster'
import { clip, fitText, fmtTime, fmtTokens, modelName, textWidth, windowOf, xml } from './format'
import type { ProgressInput, Shown } from './progress'
import { barText, mergeProgress, orgStateFrom, percentOf, shownOf, titleOf } from './progress'

const PLUGIN = 'aspire'

const BLANK_SEEN: Seen = {
  prompts: 0,
  skillPrompts: 0,
  skillTools: 0,
  progressReports: 0,
  atlasResults: 0,
  statusReads: 0,
  lastStatusAt: null,
  agents: 0,
}
const BLANK_ORG: OrgState = { name: null, checkpoints: 0 }

const isActive = atom({ plugin: 'aspire', key: 'isActive' } as const, false)
const trigger = atom({ plugin: 'aspire', key: 'trigger' } as const, null as Trigger | null)
const seen = atom({ plugin: 'aspire', key: 'seen' } as const, BLANK_SEEN)
const progress = atom({ plugin: 'aspire', key: 'progress' } as const, null as Progress | null)
const org = atom({ plugin: 'aspire', key: 'org' } as const, BLANK_ORG)
const atlas = atom({ plugin: 'aspire', key: 'atlas' } as const, null as AtlasReading | null)
const stats = atom({ plugin: 'aspire', key: 'stats' } as const, { turn: 0, speed: null, context: 0 } as BandStats)
const isBandHidden = atom({ plugin: 'aspire', key: 'isBandHidden' } as const, false)
const agents = atom({ plugin: 'aspire', key: 'agents' } as const, [] as AgentRun[])
const panel = atom({ plugin: 'aspire', key: 'panel' } as const, { isCompact: false, isDoneCollapsed: false, isAutoOpened: false, tab: 'live' } as Panel)
const now = atom({ plugin: 'aspire', key: 'now' } as const, 0)

/** The aspire skill: `/aspire`, `/aspire:aspire`, or the Skill tool's `aspire:aspire`. */
const ASPIRE_SKILL = /^(aspire:)?aspire$/
/** A prompt typed as `/aspire` or `/aspire:aspire`, with or without arguments; not `/aspire-agents-info`. */
const ASPIRE_PROMPT = /^\s*\/(aspire:)?aspire(?=\s|$)/
// The panel's command is `/aspire-agents-info`, written as a literal where it is
// registered and matched (the validator reads literals). Not `/aspire agents`,
// the skill's own list of agents, and not a prefix of any skill command.
const PANE = 'aspire-agents'
const PANE_TITLE = 'Aspire agents'
const MAX_RUNS = 200
// The progress tool as the model calls it: mcp__<plugin>__<name>.
const PROGRESS_TOOL = 'mcp__aspire__aspire_progress'
const STEP_TOOL = 'mcp__aspire__aspire_step'

// ---------------------------------------------------------------------------
// Switching on.

const isAspireAgent = (type: string, plugin: string | undefined): boolean => type.startsWith('aspire:') || plugin === PLUGIN

// The one timer: running agents' clocks. Started when
// the mod switches on, never before; a reload starts it again from session.start.
let ticker: { cancel: () => void } | null = null

// Whether the AbovePrompt slot is drawn at all on this surface. A render hook
// never writes $.state (drawing is pure), so the count is a module variable: it
// starts over on a hot reload and on /clear, and the next render counts again.
const band: { renders: number; surface: string | null } = { renders: 0, surface: null }

const tick = async ($: EngineInterface): Promise<void> => {
  const at = await $.clock.now()
  if ((await read($, agents)).some(a => a.status === 'running')) await update($, now, () => at)
}

const startTicking = ($: EngineInterface): void => {
  if (ticker) return
  ticker = $.clock.every(1000, () => {
    tick($).catch(() => undefined)
  })
}

// Turns count from the one that ran /aspire. A typed /aspire switches the mod on
// before its turn starts, so turn.start counts it; the Skill tool or an agent
// switches it on mid-turn, so the main loop's next model request counts it.
async function activate($: EngineInterface, kind: TriggerKind, detail: string): Promise<void> {
  if (!(await read($, isActive))) {
    const at = await $.clock.now()
    await update($, trigger, t => t ?? { kind, detail: clip(detail, 80), at })
    await update($, isActive, () => true)
  }
  startTicking($)
}

type Count = 'prompts' | 'skillPrompts' | 'skillTools' | 'progressReports' | 'atlasResults' | 'agents'

const count = ($: EngineInterface, key: Count) => update($, seen, s => ({ ...s, [key]: s[key] + 1 }))

async function reset($: EngineInterface): Promise<void> {
  ticker?.cancel()
  ticker = null
  await update($, isActive, () => false)
  await update($, trigger, () => null)
  await update($, seen, () => BLANK_SEEN)
  await update($, progress, () => null)
  await update($, org, () => BLANK_ORG)
  await update($, atlas, () => null)
  await update($, stats, () => ({ turn: 0, speed: null, context: 0 }))
  await update($, isBandHidden, () => false)
  band.renders = 0
  band.surface = null
  await update($, agents, () => [])
  await update($, panel, () => ({ isCompact: false, isDoneCollapsed: false, isAutoOpened: false, tab: 'live' }))
}

const isOn = async ($: EngineInterface): Promise<boolean> => {
  try {
    return await read($, isActive)
  } catch {
    return false
  }
}

/** `get_status` from `mcp__<server>__get_status`, for the status line. */
const shortTool = (tool: string): string => tool.replace(/^mcp__.*__/, '')

// ---------------------------------------------------------------------------
// The progress bar (from savvy-progress): title, bar, percent, and the crab.

const DONE = '#4caf6e'
// The whole row is one SVG: the desktop wraps sibling elements onto new lines,
// so title, bar, percent and the crab live in one drawing; only the agents
// count and the dismiss are Buttons beside it.
const BAR_ROW_H = 22
const BAR_H = 16
const CRAB_W = 0
const CELL = 3

// Deterministic noise so the dither does not shimmer between redraws.
const noise = (x: number, y: number): number => {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

const barSvg = (title: string, shown: Shown, W: number): string => {
  // The title takes what it needs, up to 40% of the row; the bar takes the rest.
  const label = fitText(title, 13, Math.max(60, W * 0.4))
  const BAR_X = Math.round(16 + textWidth(label, 13) + 12)
  const BAR_W = Math.max(60, W - BAR_X - 46 - CRAB_W)
  const color = shown.isFinished ? DONE : ASPIRE
  const y0 = (BAR_ROW_H - BAR_H) / 2
  const fillW = Math.round(BAR_W * shown.ratio)

  // Dithered fill: sparse at the start, dense toward the head.
  const dots: string[] = []
  const cols = Math.floor(fillW / CELL)
  const rows = Math.floor(BAR_H / CELL)
  for (let c = 0; c < cols; c++) {
    const density = 0.35 + 0.6 * Math.pow(c / Math.max(1, cols), 1.2)
    for (let r = 0; r < rows; r++) {
      if (noise(c, r) < density) dots.push(`<rect class="t${Math.floor(noise(r, c) * 4)}" x="${c * CELL + 1}" y="${r * CELL + 1}" width="2" height="2"/>`)
    }
  }
  const ticks: string[] = []
  for (let i = 1; i < shown.total; i++) {
    const x = Math.round((BAR_W * i) / shown.total)
    if (x > fillW + 4) ticks.push(`<rect x="${x}" y="${BAR_H / 2 - 4}" width="1.5" height="8" rx="0.75"/>`)
  }

  const pill = fitText(shown.label, 11, Math.max(20, BAR_W - 18))
  const pillW = Math.min(BAR_W, Math.round(18 + textWidth(pill, 11)))
  const pillX = Math.max(0, Math.min(BAR_W - pillW, fillW - pillW))

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${BAR_ROW_H}" viewBox="0 0 ${W} ${BAR_ROW_H}">
<style>
.t{fill:#1f1f1f}.m{fill:#8a8a8a}.k{fill:#e4e4e2}.tk{fill:#b4b4b0}
@media (prefers-color-scheme: dark){.t{fill:#ececec}.m{fill:#9a9a9a}.k{fill:#2c2c2c}.tk{fill:#5a5a5a}}
/* Pixels twinkle in four out-of-phase groups; a finished bar settles to a slow glow. */
.t0,.t1,.t2,.t3{animation:tw ${shown.isFinished ? 3.2 : 2.2}s ease-in-out infinite}
.t1{animation-duration:${shown.isFinished ? 3.8 : 2.8}s;animation-delay:-.7s}.t2{animation-duration:${shown.isFinished ? 4.4 : 1.9}s;animation-delay:-1.3s}.t3{animation-duration:${shown.isFinished ? 3.5 : 3.3}s;animation-delay:-.4s}
@keyframes tw{0%,100%{opacity:1}50%{opacity:${shown.isFinished ? 0.8 : 0.3}}}
@media (prefers-reduced-motion: reduce){.t0,.t1,.t2,.t3{animation:none}}
</style>
<defs><clipPath id="aspire-bar-clip"><rect x="0" y="0" width="${BAR_W}" height="${BAR_H}" rx="${BAR_H / 2}"/></clipPath></defs>
<circle cx="5" cy="${BAR_ROW_H / 2}" r="4" fill="${color}"/>
<text class="t" x="16" y="${BAR_ROW_H / 2 + 4.5}" font-family="${FONT}" font-size="13" font-weight="500">${xml(label)}</text>
<g transform="translate(${BAR_X},${y0})">
<rect class="k" width="${BAR_W}" height="${BAR_H}" rx="${BAR_H / 2}"/>
<g clip-path="url(#aspire-bar-clip)">
<g fill="${color}">${dots.join('')}</g>
<g class="tk">${ticks.join('')}</g>
</g>
<rect x="${pillX}" width="${pillW}" height="${BAR_H}" rx="${BAR_H / 2}" fill="${color}"/>
<text x="${pillX + pillW / 2}" y="${BAR_H / 2 + 4}" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="600" fill="#ffffff">${xml(pill)}</text>
</g>
<text class="m" x="${W - CRAB_W - 6}" y="${BAR_ROW_H / 2 + 4.5}" text-anchor="end" font-family="${FONT}" font-size="12.5" font-variant-numeric="tabular-nums">${percentOf(shown)}</text>
</svg>`
}

// ---------------------------------------------------------------------------
// The band above the prompt (from session-band), now the bar's second row.

// Responses shorter than this are mostly tool-call stubs: their timing is noise.
const MIN_TOKENS = 20
// A response that arrived in one burst cannot be timed; such readings are dropped.
const MIN_SECONDS = 0.5
const MAX_SPEED = 1000

const SPEED = '#8b8cf8'
const ATLAS = '#4caf6e'
const MUTED = '#8a8f8c'
const CONTEXT = '#5fa8d3'
const WARN = '#e2a94e'
const ALERT = '#e0846b'

const ring = (color: string, glyph: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <circle cx="12" cy="12" r="10" fill="none" stroke="${color}" stroke-width="2"/>
    ${glyph}</svg>`

const SPEED_ICON = ring(
  SPEED,
  `<path d="M6.5 15a6 6 0 0 1 11 0" fill="none" stroke="${SPEED}" stroke-width="1.8" stroke-linecap="round"/>
   <path d="M12 15l3-4" stroke="${SPEED}" stroke-width="1.8" stroke-linecap="round"/>`,
)

// The kit's cost ring, with an "A" for Atlas in place of the dollar sign.
const ATLAS_ICON = ring(
  ATLAS,
  `<text x="12" y="16.5" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="13" font-weight="600" fill="${ATLAS}">A</text>`,
)

// The ring itself fills with the context, around a page of lines.
const contextIcon = (percent: number) => {
  const c = 2 * Math.PI * 10
  const filled = (Math.min(100, percent) / 100) * c
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <circle cx="12" cy="12" r="10" fill="none" stroke="${MUTED}" stroke-opacity="0.35" stroke-width="2"/>
    <circle cx="12" cy="12" r="10" fill="none" stroke="${CONTEXT}" stroke-width="2" stroke-linecap="round"
      stroke-dasharray="${filled.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 12 12)"/>
    <g stroke="${CONTEXT}" stroke-width="1.6" stroke-linecap="round">
      <path d="M8.5 9h7M8.5 12h7M8.5 15h4.5"/>
    </g></svg>`
}

const contextBar = (percent: number) => {
  const color = percent >= 85 ? ALERT : percent >= 65 ? WARN : ATLAS
  const w = Math.round((Math.min(100, percent) / 100) * 80)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 6" width="80" height="6">
    <rect width="80" height="6" rx="3" fill="${MUTED}" fill-opacity="0.3"/>
    <rect width="${w}" height="6" rx="3" fill="${color}"/></svg>`
}

// Density by the band's width in cells, so the row shrinks instead of wrapping:
// 0 full; 1 no context bar; 2 compact turn/speed, short Atlas label; 3 no turn,
// smaller icons; 4 no speed. Thresholds are minimum bodyColumns for each tier.
const TIER_MIN = [96, 80, 64, 50] as const
const GAPS = [3, 2, 2, 1, 1] as const
const tierFor = (columns: number): number => {
  const i = TIER_MIN.findIndex(min => columns >= min)
  return i === -1 ? TIER_MIN.length : i
}

const refreshContext = async ($: EngineInterface): Promise<void> => {
  const { context } = await $.session.usage()
  if (typeof context.percent === 'number') {
    const percent = context.percent
    await update($, stats, s => ({ ...s, context: percent }))
  }
}

// ---------------------------------------------------------------------------
// The agents panel (from savvy-progress), English only.

const fmtCount = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const elapsed = (a: AgentRun, at: number): number => (a.endedAt ?? Math.max(at, a.startedAt)) - a.startedAt

const spanOf = (list: AgentRun[], at: number): number => {
  if (!list.length) return 0
  const start = Math.min(...list.map(a => a.startedAt))
  const end = Math.max(...list.map(a => a.endedAt ?? Math.max(at, a.startedAt)))
  return end - start
}

const runModel = (a: AgentRun): string => (a.effort ? `${modelName(a.model)} · ${a.effort}` : modelName(a.model))

const ctxOf = (a: AgentRun): number => (a.contextMax ? Math.min(100, Math.round((a.contextTokens / a.contextMax) * 100)) : 0)

const norm = (s: string): string => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif"

// The pane's backdrop: a dotted grid as tall as the content laid over it.
const GRID_STEP = 16
// A Text or Button row on the desktop is about 20px; the grid errs taller.
const LINE_H = 24
// The engine refuses an Svg taller than 4096px, so a long grid is stacked from tiles.
const GRID_TILE = 4096
const ROW_H = 66
const gridTiles = (H: number) => Array.from({ length: Math.ceil(H / GRID_TILE) }, (_, i) => Math.min(GRID_TILE, H - i * GRID_TILE))
const gridSvg = (W: number, H: number) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>.d{fill:#d9d8d4}@media (prefers-color-scheme: dark){.d{fill:#3a3a38}}</style>
<defs><pattern id="g" width="${GRID_STEP}" height="${GRID_STEP}" patternUnits="userSpaceOnUse"><circle class="d" cx="${GRID_STEP / 2}" cy="${GRID_STEP / 2}" r="1"/></pattern></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
</svg>`

const PANE_CSS = `<style>
.t{fill:#1f1f1f}.s{fill:#6b6b68}.m{fill:#9a9a96}.k{fill:#ecebe8}.ln{stroke:#e4e4e1}.tile{fill:#f4f3f0}
@media (prefers-color-scheme: dark){.t{fill:#ececec}.s{fill:#a8a8a4}.m{fill:#7d7d79}.k{fill:#2c2c2b}.ln{stroke:#333331}.tile{fill:#262625}}
.live{animation:p 1.6s ease-in-out infinite}@keyframes p{50%{opacity:.3}}
@media (prefers-reduced-motion: reduce){.live{animation:none}}
</style>`

const svg = (W: number, H: number, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${PANE_CSS}${CRAB_CSS}${body}</svg>`

const statusMark = (x: number, y: number, status: string, color: string): string => {
  if (status === 'running') return `<circle class="live" cx="${x}" cy="${y}" r="3.5" fill="${color}"/>`
  if (status === 'done') return `<path d="M${x - 5} ${y}l3.5 3.5 6.5-7" fill="none" stroke="#3B9C5F" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
  return `<path d="M${x - 4} ${y - 4}l8 8M${x + 4} ${y - 4}l-8 8" stroke="#D0453F" stroke-width="1.8" stroke-linecap="round"/>`
}

const HEADER_H = 44

// Two tiles: how many agents ran, and the time from the first start to the last end.
const headerSvg = (W: number, count: number, time: number): string => {
  const gap = 6
  const tw = (W - gap) / 2
  const tile = (i: number, k: string, v: string) =>
    `<rect class="tile" x="${i * (tw + gap)}" y="0" width="${tw}" height="40" rx="8"/>
<text class="s" x="${i * (tw + gap) + 9}" y="16" font-family="${FONT}" font-size="11">${k}</text>
<text class="t" x="${i * (tw + gap) + 9}" y="33" font-family="${FONT}" font-size="15" font-weight="600" font-variant-numeric="tabular-nums">${v}</text>`
  return svg(W, HEADER_H, `${tile(0, 'Agents', String(count))}${tile(1, 'Time', fmtTime(time))}`)
}

/** What an agent reported through aspire_step: `2/5 reading posts`, and the fraction. */
const stepsOf = (a: AgentRun): { text: string; ratio: number } | null =>
  a.stepTotal ? { text: `${a.stepDone ?? 0}/${a.stepTotal}${a.stepNote ? ` ${a.stepNote}` : ''}`, ratio: Math.min(1, (a.stepDone ?? 0) / a.stepTotal) } : null

const agentSvg = (W: number, a: AgentRun, at: number): string => {
  const character = characterOf(a)
  const ctx = ctxOf(a)
  const textW = W - 42 - 22
  const meta = [runModel(a)]
  if (a.round > 1) meta.push(`round ${a.round}`)
  if (a.status === 'failed') meta.push('error')
  const steps = stepsOf(a)
  const stats = `${steps ? `${steps.text} · ` : ''}ctx ${ctx}% · ${fmtTokens(a.contextTokens)}  ${fmtTime(elapsed(a, at))}`
  // A finished run is a full bar; a running one shows its reported steps, else its context fill, grey.
  const progress = a.status === 'done' ? 1 : steps ? steps.ratio : null
  const fillW = Math.round(textW * (progress ?? ctx / 100))
  return svg(
    W,
    ROW_H,
    `${crab(0, 14, character, false, a.status === 'running')}
<text class="t" x="42" y="18" font-family="${FONT}" font-size="13" font-weight="600">${xml(fitText(a.description || a.type, 13, textW))}</text>
<text x="42" y="34" font-family="${FONT}" font-size="11"><tspan fill="${character.color}">${xml(fitText(a.type, 11, textW / 2))}</tspan><tspan class="s">  ${xml(meta.join('  ·  '))}</tspan></text>
<text class="s" x="${42 + textW}" y="49" text-anchor="end" font-family="${FONT}" font-size="11" font-variant-numeric="tabular-nums">${stats}</text>
<rect class="k" x="42" y="55" width="${textW}" height="4" rx="2"/><rect${progress === null ? ' class="m"' : ''} x="42" y="55" width="${fillW}" height="4" rx="2"${progress === null ? '' : ` fill="${character.color}"`}/>
${statusMark(W - 8, 16, a.status, character.color)}
<line class="ln" x1="0" y1="65.5" x2="${W}" y2="65.5"/>`,
  )
}

const CARD_H = 60

/** A crab card for one agent type: its costume, name, what it makes, and whether it ran this session. */
const cardSvg = (W: number, entry: RosterEntry, list: AgentRun[]): string => {
  const group = GROUPS.find(g => g.key === entry.group)
  const character = characterOf(group?.costume ?? { type: entry.type, model: '' })
  const runs = list.filter(a => a.type === entry.type)
  const isRunning = runs.some(a => a.status === 'running')
  const state = isRunning ? 'running' : runs.length ? `ran ${runs.length}\u00d7` : 'ready'
  const textW = W - 42 - 74
  return svg(
    W,
    CARD_H,
    `<rect class="tile" x="0.5" y="2.5" width="${W - 1}" height="${CARD_H - 6}" rx="10"/>
${crab(8, 10, character, false, isRunning)}
<text class="t" x="50" y="25" font-family="${FONT}" font-size="13" font-weight="600">${xml(fitText(entry.name, 13, textW))}</text>
<text class="s" x="50" y="42" font-family="${FONT}" font-size="11">${xml(fitText(entry.blurb, 11, textW))}</text>
${isRunning ? `<circle class="live" cx="${W - 66}" cy="22" r="3.5" fill="${character.color}"/>` : runs.length ? `<path d="M${W - 70} 22l3.5 3.5 6.5-7" fill="none" stroke="#3B9C5F" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
<text class="${isRunning || runs.length ? 's' : 'm'}" x="${W - 12}" y="26" text-anchor="end" font-family="${FONT}" font-size="11">${state}</text>`,
  )
}

const compactSvg = (W: number, list: AgentRun[], time: number): string => {
  const icons = [...list.filter(a => a.status === 'running'), ...list.filter(a => a.status !== 'running')]
  const fit = Math.max(1, Math.floor((W - 150) / 36))
  const shown = icons.slice(0, fit)
  const more = icons.length - shown.length
  const body = shown
    .map((a, i) => {
      const character = characterOf(a)
      const isRunning = a.status === 'running'
      return crab(i * 36, 0, character, false, isRunning) + (isRunning ? `<circle class="live" cx="${i * 36 + 32}" cy="4" r="3" fill="${character.color}"/>` : '')
    })
    .join('')
  const x = shown.length * 36 + (more ? 4 : 0)
  return svg(
    W,
    32,
    `${body}${more ? `<text class="s" x="${x}" y="21" font-family="${FONT}" font-size="12">+${more}</text>` : ''}
<text class="s" x="${W}" y="21" text-anchor="end" font-family="${FONT}" font-size="12" font-variant-numeric="tabular-nums">${fmtCount(list.length, 'agent', 'agents')} · ${fmtTime(time)}</text>`,
  )
}

const ctxBar = (pct: number, width: number): string => {
  const filled = Math.round((width * pct) / 100)
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled))
}

const STATUS_GLYPH: Record<string, string> = { running: '●', done: '✓', failed: '✗' }

// Opens the agents pane, or closes it when it is up; true when it ends up open.
async function togglePane($: EngineInterface): Promise<boolean> {
  const isOpen = (await $.ui.panes()).some(p => p.id === PANE)
  if (isOpen) {
    await $.ui.close({ id: PANE })
    return false
  }
  const at = await $.clock.now()
  await update($, now, () => at)
  await $.ui.open({ id: PANE, title: PANE_TITLE })
  return true
}

// ---------------------------------------------------------------------------
// `/aspire-agents-info status`: whether the mod is on and what it has seen.

const TRIGGER_LABEL: Record<TriggerKind, string> = {
  prompt: 'a typed /aspire',
  skill: 'the aspire skill (skill.prompt)',
  'skill-tool': 'the Skill tool running the aspire skill',
  progress: 'a progress report from the skill',
  'atlas-tool': 'an Atlas tool result',
  agent: 'an aspire agent starting',
}

const ago = (ms: number): string => {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  return m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h ${m % 60} min ago`
}

async function statusText($: EngineInterface): Promise<string> {
  const at = await $.clock.now()
  const isOnNow = await isOn($)
  const t = await read($, trigger)
  const s = await read($, seen)
  const reading = await read($, atlas)
  const o = await read($, org)
  const p = await read($, progress)
  let version = 'unknown'
  try {
    version = (await $.session.version()).version
  } catch {
    // An engine without $.session.version: the rest still stands.
  }
  let surfaces = 'unknown'
  try {
    surfaces = (await $.session.surfaces()).join(', ') || 'none'
  } catch {
    // As above.
  }

  const state = !isOnNow
    ? 'Aspire mod: loaded, off. It switches on when /aspire runs, an Atlas tool answers, or an aspire agent starts.'
    : t
      ? `Aspire mod: on since ${ago(at - t.at)}, switched on by ${TRIGGER_LABEL[t.kind]} (${t.detail}).`
      : 'Aspire mod: on.'
  const counts =
    `Seen: ${fmtCount(s.prompts, '/aspire prompt', '/aspire prompts')}, ${s.skillPrompts} skill.prompt, ` +
    `${fmtCount(s.skillTools, 'Skill tool call', 'Skill tool calls')}, ${fmtCount(s.progressReports, 'progress report', 'progress reports')}, ` +
    `${fmtCount(s.atlasResults, 'Atlas result', 'Atlas results')}, ${fmtCount(s.agents, 'agent', 'agents')}.`
  const status =
    s.lastStatusAt === null
      ? 'Last get_status: none yet.'
      : `Last get_status ${ago(at - s.lastStatusAt)}: ${reading ? `${fmtAtlasUsage(reading.costs)} Atlas tokens` : 'no token costs in it'}, organization ${o.name ?? 'not picked yet'}.`
  const shown = shownOf(p, o, await read($, agents))
  const bar = isOnNow ? `Bar: ${titleOf(o)}, ${shown.label}, ${percentOf(shown)} (${shown.source === 'skill' ? 'reported by the skill' : shown.source === 'agents' ? 'from the running agents' : 'baseline from get_status'}).` : 'Bar: not shown until the mod is on.'
  const b = band
  const drawn = b.renders > 0 ? `Band: drawn ${b.renders} times, last on ${b.surface ?? 'unknown'}.` : 'Band: never drawn on this surface.'
  return [state, counts, status, bar, drawn, `Claude Code ${version} on ${surfaces}.`].join('\n')
}

// ---------------------------------------------------------------------------

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    try {
      await $.command.register({
        name: 'aspire-agents-info',
        description:
          'Show or hide the Aspire agents panel once /aspire has run; `band` shows or hides the bar above the prompt; `status` says whether the Aspire mod is on and what it has seen',
        argumentHint: '[open|band|status]',
      })
    } catch {
      // The command is a convenience; the session goes on without it.
    }
    try {
      // Behind ToolSearch like an MCP tool: in every session's deferred list, loaded only by the skill.
      await $.tool.register({
        name: 'aspire_progress',
        description:
          'Report the /aspire skill\'s progress to the Aspire progress bar above the prompt. It only draws the bar: it reads and changes nothing else. ' +
          'Call it at the start of each step with done (steps finished) and total (steps planned), with phase naming the step in a few words, ' +
          'and once at the end with finished: true. Fields left out keep their previous value; a new title starts a new run. ' +
          'For the main session only: a call from a subagent is ignored. ' +
          'The result ends with `band: visible`, `not-drawn`, `hidden-by-user` or `unknown`. When it is not `visible`, show the progress another way.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'What the run is, a few words (for example "Onboarding").' },
            total: { type: 'integer', minimum: 0, description: 'Steps planned.' },
            done: { type: 'integer', minimum: 0, description: 'Steps finished so far.' },
            phase: { type: 'string', description: 'The step in progress, a few words.' },
            tasks: {
              type: 'array',
              description: 'The planned steps in order; optional.',
              items: {
                type: 'object',
                properties: { title: { type: 'string' }, done: { type: 'boolean' } },
                required: ['title'],
              },
            },
            finished: { type: 'boolean', description: 'True once the run is over.' },
          },
        },
      })
    } catch {
      // Without the tool the bar falls back to the get_status baseline.
    }
    try {
      await $.tool.register({
        name: 'aspire_step',
        description:
          'Report an Aspire agent\'s own steps to the agents panel. It only draws a bar on that agent\'s row: it reads and changes nothing else. ' +
          'Right after reading the brief, call it with total (your plan in 3 to 8 steps) and done: 0; call it again with done and a note ' +
          '(the step in progress, a few words) as each step finishes. For agents only: a call from the main session is ignored.',
        inputSchema: {
          type: 'object',
          properties: {
            total: { type: 'integer', minimum: 1, description: 'Steps planned; may change if the plan changes.' },
            done: { type: 'integer', minimum: 0, description: 'Steps finished so far.' },
            note: { type: 'string', description: 'The step in progress, a few words.' },
          },
        },
      })
    } catch {
      // Agents show their context fill instead.
    }
    try {
      // A reload (or a resumed process) keeps $.state: pick the timer back up.
      if (await isOn($)) startTicking($)
    } catch {
      // The timer is a convenience.
    }
    return started
  })

  // A /clear starts a new conversation: the mod goes back to sleep until /aspire runs again.
  on('session.end', async ($, e, next) => {
    if (e.reason === 'clear') await reset($).catch(() => undefined)
    return next(e)
  })

  // Switch on: a prompt typed as /aspire or /aspire:aspire. The prompt passes on
  // unchanged; switching on first lets turn.start count the /aspire turn.
  on('prompt.submit', async ($, e, next) => {
    try {
      if (typeof e.text === 'string' && ASPIRE_PROMPT.test(e.text)) {
        await activate($, 'prompt', e.text.trim().split(/\s/, 1)[0] ?? '/aspire')
        await count($, 'prompts')
      }
    } catch {
      // Switching on is a convenience: the prompt goes on whatever happens here.
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  // Switch on: the aspire skill's prompt was expanded (/aspire typed, or the
  // Skill tool). Claude Code passes this event over installed plugins in some
  // hosts (the desktop app); the prompt and Skill tool hooks cover those.
  on('skill.prompt', { skill: /^(aspire:)?aspire$/ }, async ($, e, next) => {
    const result = await next(e)
    try {
      await activate($, 'skill', e.skill)
      await count($, 'skillPrompts')
    } catch {
      // As above.
    }
    return result
  })

  // Switch on: the model ran the aspire skill through the Skill tool. The call
  // and its result pass through unchanged.
  on('tool.call', { tool: 'Skill' }, async ($, e, next) => {
    const result = await next(e)
    try {
      if (result.deny !== undefined || result.isError) return result
      const skill = (e as { skill?: unknown }).skill
      if (typeof skill === 'string' && ASPIRE_SKILL.test(skill.trim().replace(/^\//, ''))) {
        await activate($, 'skill-tool', skill.trim())
        await count($, 'skillTools')
      }
    } catch {
      // As above.
    }
    return result
  }).catch(($, e, next) => next(e))

  // The skill's progress. The bar is the main session's: a call from a subagent
  // carries its agentId and changes nothing, so no agent can rename, finish, or
  // reset it.
  on('tool.call', { tool: PROGRESS_TOOL }, async ($, e) => {
    if (e.agentId) return { result: 'ignored: only the main session reports Aspire progress' }
    try {
      await activate($, 'progress', 'aspire_progress')
      await count($, 'progressReports')
      const p = await update($, progress, prev => mergeProgress(prev, e as unknown as ProgressInput))
      const shown = shownOf(p, await read($, org), await read($, agents))
      const b = band
      const hidden = await read($, isBandHidden)
      const visibility = hidden ? 'hidden-by-user' : b.renders > 0 ? `visible on ${b.surface ?? 'unknown'}` : 'not-drawn'
      return { result: `ok: ${shown.label}, ${percentOf(shown)}; band: ${visibility}` }
    } catch {
      return { result: 'ok; band: unknown' }
    }
  }).catch(() => ({ result: 'ok; band: unknown' }))

  // An agent's own steps, drawn on its row in the panel. The call runs in the
  // agent's loop, so agentId names it; the main session and an unknown agent
  // change nothing, and it never switches the mod on.
  on('tool.call', { tool: STEP_TOOL }, async ($, e) => {
    const agentId = (e as { agentId?: string }).agentId
    if (!agentId) return { result: 'ignored: only agents report steps' }
    try {
      if (!(await isOn($))) return { result: 'ok' }
      const input = e as unknown as { total?: unknown; done?: unknown; note?: unknown }
      const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.round(v)) : undefined)
      const note = typeof input.note === 'string' ? clip(input.note.trim(), 40) : undefined
      let isKnown = false
      await update($, agents, list =>
        list.map(a => {
          if (a.agentId !== agentId) return a
          isKnown = true
          const total = num(input.total) ?? a.stepTotal ?? 0
          const done = num(input.done) ?? a.stepDone ?? 0
          return { ...a, stepTotal: total, stepDone: total ? Math.min(total, done) : done, stepNote: note === undefined ? a.stepNote : note || undefined }
        }),
      )
      return { result: isKnown ? 'ok' : 'ok: not listed in the panel' }
    } catch {
      return { result: 'ok' }
    }
  }).catch(() => ({ result: 'ok' }))

  // Atlas tool results: any one switches the mod on; a get_status result also
  // gives the token costs, the organization, and the onboarding baseline. The
  // call and its result are never changed; a get_status without token costs
  // clears the figure, so the band never shows one the latest call did not give.
  on('tool.call', { tool: /^mcp__/ }, async ($, e, next) => {
    const result = await next(e)
    try {
      if (result.deny !== undefined || result.isError) return result
      const tool = String(e.tool)
      if (tool === PROGRESS_TOOL || tool === STEP_TOOL) return result
      const payload = { result: result.result, text: result.text }
      const isStatus = isAtlasStatusCall(tool, payload)
      if (!isStatus && !isAtlasToolName(tool)) return result
      await activate($, 'atlas-tool', shortTool(tool))
      await count($, 'atlasResults')
      if (isStatus) {
        const at = await $.clock.now()
        const costs = readAtlasUsage(payload)
        await update($, atlas, () => (costs ? { costs, at } : null))
        await update($, seen, s => ({ ...s, statusReads: s.statusReads + 1, lastStatusAt: at }))
        const isOrgNamed = typeof (e as { asOrganizationId?: unknown }).asOrganizationId === 'string'
        const reading = readAtlasOrg(payload)
        await update($, org, prev => orgStateFrom(prev, reading, isOrgNamed))
      }
    } catch {
      // The bar is a convenience: the call's result stands as it came.
    }
    return result
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'aspire-agents-info' }, async ($, e) => {
    try {
      const arg = e.args.trim()
      if (arg === 'status') return { text: await statusText($) }
      if (!(await isOn($))) return { text: 'The Aspire agents panel starts once /aspire runs in this session.' }
      if (arg === 'band') {
        const hidden = !(await read($, isBandHidden))
        await update($, isBandHidden, () => hidden)
        return { text: hidden ? 'Aspire band hidden.' : 'Aspire band shown.' }
      }
      if (arg === 'open') {
        const at = await $.clock.now()
        await update($, now, () => at)
        await $.ui.open({ id: PANE, title: PANE_TITLE })
        return { text: 'Aspire agents panel opened.' }
      }
      return { text: (await togglePane($)) ? 'Aspire agents panel opened.' : 'Aspire agents panel closed.' }
    } catch {
      return { text: 'The Aspire agents panel could not be drawn here.' }
    }
  }).catch(() => ({ text: 'The Aspire agents panel could not be drawn here.' }))

  on('turn.start', async ($, e, next) => {
    if (await isOn($)) await update($, stats, s => ({ ...s, turn: s.turn + 1 })).catch(() => undefined)
    return next(e)
  })

  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    try {
      if (started.deny !== undefined) return started
      const isAspire = isAspireAgent(e.subagentType, e.provider?.plugin)
      if (!isAspire && !(await isOn($))) return started
      if (isAspire) await activate($, 'agent', e.subagentType)

      const at = await $.clock.now()
      await update($, agents, list => {
        const round = 1 + list.filter(a => e.description && norm(a.description) === norm(e.description)).length
        const run: AgentRun = {
          id: started.agentId ?? e.tool_use_id,
          agentId: started.agentId,
          type: e.subagentType,
          description: e.description,
          model: started.model,
          status: 'running',
          startedAt: at,
          contextTokens: 0,
          contextMax: windowOf(started.model),
          round,
        }
        return [...list.filter(a => a.id !== run.id), run].slice(-MAX_RUNS)
      })
      await update($, now, () => at)
      await count($, 'agents')

      // The panel opens by itself once per session, for the first aspire:* agent.
      if (isAspire && !(await read($, panel)).isAutoOpened) {
        await update($, panel, p => ({ ...p, isAutoOpened: true }))
        void $.ui.open({ id: PANE, title: PANE_TITLE }).catch(() => undefined)
      }
    } catch {
      // The panel is a convenience: the agent runs whatever happens here.
    }
    return started
  }).catch(($, e, next) => next(e))

  // Each model request: the main loop's output speed and context; a subagent's
  // model, effort and context fill.
  on('turn.step', async function* ($, e, next) {
    if (!(await isOn($))) return yield* next(e)

    const stream = next(e)
    let startedAt: number | null = null
    for await (const chunk of stream) {
      // Timed from the response's first item, so time to first token is left out.
      if (startedAt === null && e.agentId === undefined) startedAt = await $.clock.now().catch(() => null)
      yield chunk
    }
    const result = await stream.result

    try {
      const usage = result.usage
      if (e.agentId === undefined) {
        await update($, stats, s => (s.turn === 0 ? { ...s, turn: 1 } : s))
        if (usage && startedAt !== null) {
          const tokens = usage.output_tokens
          const seconds = ((await $.clock.now()) - startedAt) / 1000
          const speed = tokens / seconds
          if (tokens >= MIN_TOKENS && seconds >= MIN_SECONDS && speed <= MAX_SPEED) {
            await update($, stats, s => ({ ...s, speed: Math.round(speed) }))
          }
        }
        await refreshContext($)
      } else if (usage) {
        const agentId = e.agentId
        const model = usage.model || e.model
        await update($, agents, list =>
          list.map((a): AgentRun =>
            a.agentId !== agentId
              ? a
              : {
                  ...a,
                  model,
                  effort: typeof e.effort === 'string' ? e.effort : a.effort,
                  status: 'running',
                  endedAt: undefined,
                  contextTokens:
                    (usage.input_tokens || 0) +
                    (usage.cache_read_input_tokens || 0) +
                    (usage.cache_creation_input_tokens || 0) +
                    (usage.output_tokens || 0),
                  contextMax: windowOf(model),
                },
          ),
        )
      }
    } catch {
      // Readings are best effort; the response is already through.
    }
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    try {
      if (!(await isOn($))) return result
      const at = await $.clock.now()
      if (e.agentId === undefined) {
        await refreshContext($)
      } else {
        const agentId = e.agentId
        await update($, agents, list =>
          list.map((a): AgentRun =>
            a.agentId !== agentId
              ? a
              : { ...a, status: e.reason === 'answer' ? 'done' : 'failed', endedAt: at, model: e.usage?.model || a.model },
          ),
        )
        await update($, now, () => at)
      }
    } catch {
      // Readings are best effort.
    }
    return result
  })

  // Above the prompt: the progress bar (from savvy-progress), then the band's
  // row (from session-band), then whatever other mods draw beneath.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // Counted before any early return, so the progress tool can tell whether this surface draws the slot at all.
    band.renders += 1
    band.surface = e.surface ?? null
    if (e.props.hasSurvey || !(await isOn($)) || (await read($, isBandHidden))) return next(e)
    // Claude Code's own placeholder ({ type: 'engine' }) is never nested: the desktop drops a band that nests it.
    const drawn = await Promise.resolve(next(e)).catch(() => null)
    const below = drawn && typeof drawn === 'object' && (drawn as { type?: string }).type !== 'engine' ? drawn : null

    const s = await read($, stats)
    const reading = await read($, atlas)
    const o = await read($, org)
    const list = await read($, agents)
    const shown = shownOf(await read($, progress), o, list)
    const title = titleOf(o)
    const percent = percentOf(shown)

    const ui = $.ui.resolve(e)
    const { Box, Button, Text } = ui
    // The terminal's element table has an Svg that draws nothing: test the surface too.
    const Svg = e.surface !== 'terminal' && 'Svg' in ui ? ui.Svg : null

    // The crab and the count are one control: pressing either opens the agents panel. A Button holds
    // only text, so the crab here is the glyph, not the drawing (an Svg cannot be pressed).
    const agentsButton = (
      <Button key="aspire-agents" label={`×${list.length}`} plain onPress={() => void togglePane($)}>
        <Text color={ASPIRE}>🦀</Text> ×{list.length}
      </Button>
    )
    const dismiss = <Button key="aspire-band-hide" label="✕" role="dismiss" plain dimColor onPress={() => update($, isBandHidden, () => true)} />

    // Desktop: one Svg row, about 8 CSS px per reported column; the rest is the
    // count, the dismiss and their gaps. Terminal: the same row as text.
    const cols = e.props.bodyColumns
    const svgW = Math.max(180, Math.min(1600, (cols || 100) * 8 - 96))
    const titleW = Math.max(8, Math.min(30, title.length + 2, Math.floor(cols / 3)))
    const textBarW = Math.max(6, Math.min(40, cols - titleW - 32))
    const barColor = shown.isFinished ? DONE : ASPIRE
    const barRow = Svg ? (
      <Box flexDirection="row" alignItems="center" gap={1}>
        <Svg source={barSvg(title, shown, svgW)} alt={`${title}: ${shown.label}, ${percent}`} width={svgW} height={BAR_ROW_H} />
        {agentsButton}
        {dismiss}
      </Box>
    ) : (
      <Box flexDirection="row" gap={2}>
        <Box width={titleW} flexShrink={0}>
          <Text color={barColor}>● </Text>
          <Text wrap="truncate-end">{title}</Text>
        </Box>
        <Text color={barColor}>{barText(shown.ratio, textBarW)}</Text>
        <Text bold>{shown.label}</Text>
        <Text dimColor>{percent}</Text>
        {agentsButton}
        {dismiss}
      </Box>
    )

    const tier = tierFor(e.props.bodyColumns)
    const icon = tier >= 3 ? 18 : 22
    const speed = s.speed === null ? '—' : tier <= 1 ? `${s.speed} tok/s` : `${s.speed}/s`
    const atlasText = reading ? fmtAtlasUsage(reading.costs) : tier <= 1 ? ATLAS_ABSENT_HINT : ATLAS_ABSENT
    const atlasLabel = tier <= 1 ? 'Atlas tokens' : 'Atlas'

    const statsRow = (
      <Box
        flexDirection="row"
        alignItems="center"
        columnGap={GAPS[tier]}
        flexWrap="nowrap"
        overflow="hidden"
        paddingX={1}
      >
        {tier <= 2 ? (
          <Box flexDirection="row" alignItems="center" columnGap={1} flexShrink={0}>
            {tier <= 1 ? <Text dimColor>Turn</Text> : <Text dimColor>#</Text>}
            <Text bold>{String(s.turn)}</Text>
          </Box>
        ) : null}
        {tier <= 3 ? (
          <Box flexDirection="row" alignItems="center" columnGap={1} flexShrink={0}>
            {Svg ? <Svg source={SPEED_ICON} alt="speed" width={icon} height={icon} /> : <Text color={SPEED}>⚡</Text>}
            <Text bold wrap="truncate-end">{speed}</Text>
          </Box>
        ) : null}
        <Box flexDirection="row" alignItems="center" columnGap={1} flexShrink={0}>
          {Svg ? <Svg source={ATLAS_ICON} alt="Atlas tokens" width={icon} height={icon} /> : <Text color={ATLAS}>A</Text>}
          <Text dimColor>{atlasLabel}</Text>
          <Text bold color={reading ? ATLAS : undefined}>{atlasText}</Text>
        </Box>
        <Box flexGrow={1} flexShrink={1} />
        <Box flexDirection="row" alignItems="center" columnGap={1} flexShrink={0}>
          {Svg ? <Svg source={contextIcon(s.context)} alt="context" width={icon} height={icon} /> : null}
          {Svg && tier === 0 ? <Svg source={contextBar(s.context)} alt={`context ${s.context}%`} width={80} height={6} /> : null}
          <Text bold>{`${s.context}%`}</Text>
        </Box>
      </Box>
    )

    return (
      <Box flexDirection="column">
        {barRow}
        {statsRow}
        {below}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const ui = $.ui.resolve(e)
    const { Box, Text, Button } = ui
    const list = await read($, agents)
    const p: Panel = await read($, panel)
    const at = Math.max(await read($, now), ...list.map(a => a.startedAt), 0)

    const running = list.filter(a => a.status === 'running').reverse()
    const finished = list.filter(a => a.status !== 'running').reverse()
    const time = spanOf(list, at)
    const summary = `${fmtCount(list.length, 'agent', 'agents')}, ${fmtTime(time)}`
    const isEmpty = list.length === 0
    const empty = 'No agents yet. Aspire agents show here as they start.'

    const toggleCompact = (
      <Button
        key="compact"
        label={p.isCompact ? 'Expand' : 'Collapse'}
        plain
        onPress={() => update($, panel, prev => ({ ...prev, isCompact: !prev.isCompact }))}
      />
    )
    const toggleDone = (
      <Button
        key="done"
        label={`${p.isDoneCollapsed ? '▸' : '▾'} Finished · ${finished.length}`}
        plain
        onPress={() => update($, panel, prev => ({ ...prev, isDoneCollapsed: !prev.isDoneCollapsed }))}
      />
    )

    const setTab = (tab: Panel['tab']) => () => void update($, panel, prev => ({ ...prev, tab }))
    const tabs = (
      <Box flexDirection="row" gap={2}>
        <Button key="tab-live" label="Live" plain dimColor={p.tab !== 'live'} onPress={setTab('live')} />
        <Button key="tab-agents" label={`Agents · ${ROSTER.length}`} plain dimColor={p.tab !== 'agents'} onPress={setTab('agents')} />
      </Box>
    )
    const stateOf = (entry: RosterEntry): string => {
      const runs = list.filter(a => a.type === entry.type)
      return runs.some(a => a.status === 'running') ? '●' : runs.length ? '✓' : '○'
    }

    if (p.tab === 'agents') {
      if (e.surface === 'desktop' && 'Svg' in ui) {
        const { Svg } = ui
        const W = Math.max(240, Math.min(900, (e.props.bodyColumns || 40) * 8 - 8))
        return (
          <Box flexDirection="column">
            {tabs}
            {GROUPS.map(g => {
              const entries = ROSTER.filter(r => r.group === g.key)
              return (
                <Box key={g.key} flexDirection="column">
                  <Text dimColor>{`${g.title} · ${entries.length}`}</Text>
                  {entries.map(r => (
                    <Svg key={r.type} source={cardSvg(W, r, list)} alt={`${r.name}: ${r.blurb}`} width={W} height={CARD_H} />
                  ))}
                </Box>
              )
            })}
          </Box>
        )
      }
      return (
        <Box flexDirection="column">
          {tabs}
          {GROUPS.map(g => (
            <Box key={g.key} flexDirection="column" marginTop={1}>
              <Text dimColor>{`${g.title} · ${ROSTER.filter(r => r.group === g.key).length}`}</Text>
              {ROSTER.filter(r => r.group === g.key).map(r => (
                <Text key={r.type} wrap="truncate-end">
                  <Text color={characterOf(g.costume).color}>{stateOf(r)}</Text> <Text bold>{r.name}</Text> <Text dimColor>{r.blurb}</Text>
                </Text>
              ))}
            </Box>
          ))}
        </Box>
      )
    }

    if (e.surface === 'desktop' && 'Svg' in ui) {
      const { Svg } = ui
      const W = Math.max(240, Math.min(900, (e.props.bodyColumns || 40) * 8 - 8))
      if (p.isCompact) {
        return (
          <Box flexDirection="column" gap={1}>
            {tabs}
            <Svg source={compactSvg(W, list, time)} alt={summary} width={W} height={32} />
            {toggleCompact}
          </Box>
        )
      }
      const shownDone = p.isDoneCollapsed ? 0 : finished.length
      const lines = 2 + (isEmpty ? 1 : 0) + (running.length > 0 ? 1 : 0) + (finished.length > 0 ? 1 : 0)
      const gridH = HEADER_H + lines * LINE_H + (running.length + shownDone) * ROW_H
      return (
        <Box flexDirection="column">
          {/* The grid sizes the pane; the content is placed over it. */}
          {gridTiles(gridH).map((tileH, i) => (
            <Svg key={`grid-${i}`} source={gridSvg(W, tileH)} alt="dotted grid" width={W} height={tileH} />
          ))}
          <Box flexDirection="column" position="absolute" top={0} left={0} right={0}>
            <Svg source={headerSvg(W, list.length, time)} alt={summary} width={W} height={HEADER_H} />
            {tabs}
            {toggleCompact}
            {isEmpty && <Text dimColor>{empty}</Text>}
            {running.length > 0 && <Text dimColor>{`Running · ${running.length}`}</Text>}
            {running.map(a => (
              <Svg key={a.id} source={agentSvg(W, a, at)} alt={`${a.description}: ${modelName(a.model)}, running`} width={W} height={ROW_H} />
            ))}
            {finished.length > 0 && toggleDone}
            {!p.isDoneCollapsed &&
              finished.map(a => (
                <Svg key={a.id} source={agentSvg(W, a, at)} alt={`${a.description}: ${modelName(a.model)}, finished`} width={W} height={ROW_H} />
              ))}
          </Box>
        </Box>
      )
    }

    // Terminal and the other surfaces: the same content in text rows.
    const cols = Math.max(24, e.props.bodyColumns || 40)
    const barW = Math.max(6, Math.min(20, cols - 34))
    const row = (a: AgentRun) => {
      const character = characterOf(a)
      const ctx = ctxOf(a)
      return (
        <Box key={a.id} flexDirection="column" marginBottom={1}>
          <Box flexDirection="row" gap={1}>
            <Text color={character.color}>▣</Text>
            <Text bold wrap="truncate-end">
              {a.description || a.type}
            </Text>
            <Text color={a.status === 'failed' ? 'red' : a.status === 'done' ? 'green' : character.color}>{STATUS_GLYPH[a.status]}</Text>
          </Box>
          <Text dimColor wrap="truncate-end">
            {'  '}
            {a.type} · {runModel(a)}
            {a.round > 1 ? ` · round ${a.round}` : ''}
          </Text>
          <Text wrap="truncate-end">
            {'  '}
            {a.status === 'done' ? (
              <Text color={character.color}>{ctxBar(100, barW)}</Text>
            ) : stepsOf(a) ? (
              <Text color={character.color}>{ctxBar(Math.round((stepsOf(a)?.ratio ?? 0) * 100), barW)}</Text>
            ) : (
              <Text dimColor>{ctxBar(ctx, barW)}</Text>
            )}
            <Text dimColor>
              {' '}
              {stepsOf(a) ? `${stepsOf(a)?.text} · ` : ''}ctx {ctx}% · {fmtTokens(a.contextTokens)} {fmtTime(elapsed(a, at))}
            </Text>
          </Text>
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
        {tabs}
        <Box flexDirection="row" justifyContent="space-between">
          <Text dimColor>{summary}</Text>
          {toggleCompact}
        </Box>
        {p.isCompact ? (
          <Text wrap="truncate-end">
            {[...running, ...finished].map(a => (
              <Text key={a.id} color={characterOf(a).color}>
                {STATUS_GLYPH[a.status]}{' '}
              </Text>
            ))}
          </Text>
        ) : (
          <Box flexDirection="column" marginTop={1}>
            {isEmpty && <Text dimColor>{empty}</Text>}
            {running.length > 0 && <Text dimColor>{`Running · ${running.length}`}</Text>}
            {running.map(row)}
            {finished.length > 0 && toggleDone}
            {!p.isDoneCollapsed && finished.map(row)}
          </Box>
        )}
      </Box>
    )
  })
}
