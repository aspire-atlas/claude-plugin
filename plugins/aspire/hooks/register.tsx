// The Aspire mod: a band above the prompt and an agents panel, for Claude Code.
//
// It stays inert until /aspire runs in the session (the aspire skill's prompt
// is expanded) or an aspire:* agent starts: before that every hook passes the
// event straight on and records nothing. After that it reads what already
// passes through the session (Atlas get_status results, subagent starts and
// ends, model response timing, the context fill) and draws it. It makes no
// network calls, starts no processes, reads and writes no files, and changes
// no tool call, prompt, or agent.
//
// Early-access API (function hooks): written and tested on Claude Code 2.1.295.
//
// The band and the panel are adapted from two mods in claude-kit,
// https://github.com/johnnyvizz/claude-kit: session-band (the band) and
// savvy-progress (the agents panel), used under the MIT License:
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
// What changed from the kit: the band's cost shows Atlas token costs from
// get_status (./atlas-usage.ts) instead of Claude's own cost; the cache warning
// notifications (a helper app, Claude Code's push notification, the desktop
// session file read) are gone; the panel drops savvy-flow's plan, its progress
// and step tools, the Claude price table and every cost figure, and its
// Russian and Hebrew strings (English only); the characters moved to
// ./characters.ts.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { AgentRun, AtlasReading, BandStats, Cache, Panel } from '../types'
import { ATLAS_ABSENT, ATLAS_ABSENT_HINT, fmtAtlasUsage, isAtlasStatusCall, readAtlasUsage } from './atlas-usage'
import { CRAB_CSS, characterOf, crab } from './characters'
import { fitText, fmtCountdown, fmtTime, fmtTokens, modelName, windowOf, xml } from './format'

const PLUGIN = 'aspire'

const isActive = atom({ plugin: 'aspire', key: 'isActive' } as const, false)
const atlas = atom({ plugin: 'aspire', key: 'atlas' } as const, null as AtlasReading | null)
const stats = atom({ plugin: 'aspire', key: 'stats' } as const, { turn: 0, speed: null, context: 0 } as BandStats)
const cache = atom({ plugin: 'aspire', key: 'cache' } as const, { expiresAt: null, secondsLeft: null } as Cache)
const isBandHidden = atom({ plugin: 'aspire', key: 'isBandHidden' } as const, false)
const agents = atom({ plugin: 'aspire', key: 'agents' } as const, [] as AgentRun[])
const panel = atom({ plugin: 'aspire', key: 'panel' } as const, { isCompact: false, isDoneCollapsed: false, isAutoOpened: false } as Panel)
const now = atom({ plugin: 'aspire', key: 'now' } as const, 0)

/** The skill that switches the mod on: `/aspire`, `/aspire:aspire`, or the Skill tool. */
const ASPIRE_SKILL = /^(aspire:)?aspire$/
// The panel's command is `/aspire-agents-info`, written as a literal where it is
// registered and matched (the validator reads literals). Not `/aspire agents`,
// the skill's own list of agents, and not a prefix of any skill command.
const PANE = 'aspire-agents'
const PANE_TITLE = 'Aspire agents'
const MAX_RUNS = 200

// ---------------------------------------------------------------------------
// Switching on.

const isAspireAgent = (type: string, plugin: string | undefined): boolean => type.startsWith('aspire:') || plugin === PLUGIN

// The one timer: the cache countdown and running agents' clocks. Started when
// the mod switches on, never before; a reload starts it again from session.start.
let ticker: { cancel: () => void } | null = null

const tick = async ($: EngineInterface): Promise<void> => {
  const at = await $.clock.now()
  const c = await read($, cache)
  if (c.expiresAt !== null) {
    const left = Math.max(0, Math.floor((c.expiresAt - at) / 1000))
    if (left !== c.secondsLeft) await update($, cache, prev => ({ ...prev, secondsLeft: left }))
  }
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
async function activate($: EngineInterface): Promise<void> {
  if (!(await read($, isActive))) await update($, isActive, () => true)
  startTicking($)
}

async function reset($: EngineInterface): Promise<void> {
  ticker?.cancel()
  ticker = null
  await update($, isActive, () => false)
  await update($, atlas, () => null)
  await update($, stats, () => ({ turn: 0, speed: null, context: 0 }))
  await update($, cache, () => ({ expiresAt: null, secondsLeft: null }))
  await update($, isBandHidden, () => false)
  await update($, agents, () => [])
  await update($, panel, () => ({ isCompact: false, isDoneCollapsed: false, isAutoOpened: false }))
}

const isOn = async ($: EngineInterface): Promise<boolean> => {
  try {
    return await read($, isActive)
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// The band above the prompt (from session-band).

// Responses shorter than this are mostly tool-call stubs: their timing is noise.
const MIN_TOKENS = 20
// A response that arrived in one burst cannot be timed; such readings are dropped.
const MIN_SECONDS = 0.5
const MAX_SPEED = 1000

// The prompt cache lives an hour after the last answer, as Claude Code writes it on a subscription.
const CACHE_TTL_MS = 60 * 60 * 1000
const CACHE_WARN_S = 20 * 60
const CACHE_ALERT_S = 10 * 60

const SPEED = '#8b8cf8'
const ATLAS = '#4caf6e'
const MUTED = '#8a8f8c'
const CONTEXT = '#5fa8d3'
const CACHE = '#4fb3a9'
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

// An hourglass: the prompt cache running out.
const cacheIcon = (color: string) =>
  ring(
    color,
    `<g fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
       <path d="M8.5 6.5h7M8.5 17.5h7"/>
       <path d="M9.5 6.5c0 3 5 3.5 5 5.5s-5 2.5-5 5.5M14.5 6.5c0 3-5 3.5-5 5.5s5 2.5 5 5.5"/>
     </g>`,
  )

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

const agentSvg = (W: number, a: AgentRun, at: number): string => {
  const character = characterOf(a)
  const ctx = ctxOf(a)
  const textW = W - 42 - 22
  const meta = [runModel(a)]
  if (a.round > 1) meta.push(`round ${a.round}`)
  if (a.status === 'failed') meta.push('error')
  const stats = `ctx ${ctx}% · ${fmtTokens(a.contextTokens)}  ${fmtTime(elapsed(a, at))}`
  // A finished run is a full bar; a running one shows its context fill, grey.
  const progress = a.status === 'done' ? 1 : null
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

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    try {
      await $.command.register({
        name: 'aspire-agents-info',
        description: 'Show or hide the Aspire agents panel once /aspire has run; `band` shows or hides the band above the prompt',
        argumentHint: '[open|band]',
      })
      // A reload (or a resumed process) keeps $.state: pick the timer back up.
      if (await isOn($)) startTicking($)
    } catch {
      // The command and the timer are conveniences; the session goes on without them.
    }
    return started
  })

  // A /clear starts a new conversation: the mod goes back to sleep until /aspire runs again.
  on('session.end', async ($, e, next) => {
    if (e.reason === 'clear') await reset($).catch(() => undefined)
    return next(e)
  })

  // Switch on: the aspire skill's prompt was expanded (/aspire typed, or the Skill tool).
  on('skill.prompt', { skill: ASPIRE_SKILL }, async ($, e, next) => {
    const result = await next(e)
    await activate($).catch(() => undefined)
    return result
  })

  on('command.run', { command: 'aspire-agents-info' }, async ($, e) => {
    try {
      if (!(await isOn($))) return { text: 'The Aspire agents panel starts once /aspire runs in this session.' }
      const arg = e.args.trim()
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

  // Atlas token costs: read from each Atlas get_status result as it passes. The
  // call and its result are never changed; a result with no token costs clears
  // the reading, so the band never shows a figure the latest call did not give.
  on('tool.call', { tool: /__get_status$/ }, async ($, e, next) => {
    if (!(await isOn($))) return next(e)
    const result = await next(e)
    try {
      if (result.deny !== undefined || result.isError) return result
      const payload = { result: result.result, text: result.text }
      if (!isAtlasStatusCall(String(e.tool), payload)) return result
      const costs = readAtlasUsage(payload)
      const at = await $.clock.now()
      await update($, atlas, () => (costs ? { costs, at } : null))
    } catch {
      // The band is a convenience: the call's result stands as it came.
    }
    return result
  }).catch(($, e, next) => next(e))

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
      if (isAspire) await activate($)

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
        await update($, cache, () => ({ expiresAt: at + CACHE_TTL_MS, secondsLeft: CACHE_TTL_MS / 1000 }))
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

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || !(await isOn($))) return next(e)
    const isHidden = await read($, isBandHidden)
    // Draw this row with the other mods' bands beneath it. Claude Code's own
    // placeholder ({ type: 'engine' }) is never nested: the desktop drops a band that nests it.
    const drawn = await Promise.resolve(next(e)).catch(() => null)
    const below = drawn && typeof drawn === 'object' && (drawn as { type?: string }).type !== 'engine' ? drawn : null

    const s = await read($, stats)
    const reading = await read($, atlas)
    const { secondsLeft } = await read($, cache)

    const ui = $.ui.resolve(e)
    const { Box, Button, Text } = ui
    // The terminal's element table has an Svg that draws nothing: test the surface too.
    const Svg = e.surface !== 'terminal' && 'Svg' in ui ? ui.Svg : null

    const tier = tierFor(e.props.bodyColumns)
    const icon = tier >= 3 ? 18 : 22
    const speed = s.speed === null ? '—' : tier <= 1 ? `${s.speed} tok/s` : `${s.speed}/s`
    const atlasText = reading ? fmtAtlasUsage(reading.costs) : tier <= 1 ? ATLAS_ABSENT_HINT : ATLAS_ABSENT
    const atlasLabel = tier <= 1 ? 'Atlas tokens' : 'Atlas'

    const level =
      e.props.isWorking || secondsLeft === null ? null : secondsLeft <= CACHE_ALERT_S ? ALERT : secondsLeft <= CACHE_WARN_S ? WARN : null
    const cacheColor = level ?? CACHE
    const cacheText = e.props.isWorking ? '…' : secondsLeft === null ? '—' : fmtCountdown(secondsLeft)

    // The way into the agents panel: the crab and the agent count. It stays when the band is hidden.
    const runs = await read($, agents)
    const runningNow = runs.find(a => a.status === 'running')
    const openPanel = () =>
      void $.clock
        .now()
        .then(at => update($, now, () => at))
        .then(() => $.ui.open({ id: PANE, title: PANE_TITLE }))
        .catch(() => undefined)
    const launcher = (
      <Box flexDirection="row" alignItems="center" columnGap={1} flexShrink={0}>
        {Svg ? (
          <Svg
            source={svg(34, 32, crab(1, 1, characterOf(runningNow ?? { type: 'aspire', model: '' }), false, Boolean(runningNow)))}
            alt="Aspire agents"
            width={icon + 4}
            height={icon + 2}
          />
        ) : null}
        <Button key="aspire-open-panel" label={`×${runs.length}`} plain onPress={openPanel} />
      </Box>
    )

    if (isHidden) {
      const slim = (
        <Box flexDirection="row" alignItems="center" columnGap={GAPS[tier]} paddingX={1}>
          {launcher}
          <Button key="aspire-band-show" label="Show band" plain dimColor onPress={() => update($, isBandHidden, () => false)} />
        </Box>
      )
      return below ? (
        <Box flexDirection="column">
          {slim}
          {below}
        </Box>
      ) : (
        slim
      )
    }

    const row = (
      <Box
        flexDirection="row"
        alignItems="center"
        columnGap={GAPS[tier]}
        flexWrap="nowrap"
        overflow="hidden"
        paddingX={1}
        {...(level ? { borderStyle: 'round', borderColor: level } : {})}
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
        <Box flexDirection="row" alignItems="center" columnGap={1} flexShrink={0}>
          {Svg ? <Svg source={cacheIcon(cacheColor)} alt="cache" width={icon} height={icon} /> : <Text color={cacheColor}>⧗</Text>}
          <Text bold color={level ?? undefined}>{cacheText}</Text>
        </Box>
        <Box flexGrow={1} flexShrink={1} />
        <Box flexDirection="row" alignItems="center" columnGap={1} flexShrink={0}>
          {Svg ? <Svg source={contextIcon(s.context)} alt="context" width={icon} height={icon} /> : null}
          {Svg && tier === 0 ? <Svg source={contextBar(s.context)} alt={`context ${s.context}%`} width={80} height={6} /> : null}
          <Text bold>{`${s.context}%`}</Text>
        </Box>
        {launcher}
        <Button key="aspire-band-hide" label="×" role="dismiss" plain dimColor onPress={() => update($, isBandHidden, () => true)} />
      </Box>
    )

    return below ? (
      <Box flexDirection="column">
        {row}
        {below}
      </Box>
    ) : (
      row
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

    if (e.surface === 'desktop' && 'Svg' in ui) {
      const { Svg } = ui
      const W = Math.max(240, Math.min(900, (e.props.bodyColumns || 40) * 8 - 8))
      if (p.isCompact) {
        return (
          <Box flexDirection="column" gap={1}>
            <Svg source={compactSvg(W, list, time)} alt={summary} width={W} height={32} />
            {toggleCompact}
          </Box>
        )
      }
      const shownDone = p.isDoneCollapsed ? 0 : finished.length
      const lines = 1 + (isEmpty ? 1 : 0) + (running.length > 0 ? 1 : 0) + (finished.length > 0 ? 1 : 0)
      const gridH = HEADER_H + lines * LINE_H + (running.length + shownDone) * ROW_H
      return (
        <Box flexDirection="column">
          {/* The grid sizes the pane; the content is placed over it. */}
          {gridTiles(gridH).map((tileH, i) => (
            <Svg key={`grid-${i}`} source={gridSvg(W, tileH)} alt="dotted grid" width={W} height={tileH} />
          ))}
          <Box flexDirection="column" position="absolute" top={0} left={0} right={0}>
            <Svg source={headerSvg(W, list.length, time)} alt={summary} width={W} height={HEADER_H} />
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
            {a.status === 'done' ? <Text color={character.color}>{ctxBar(100, barW)}</Text> : <Text dimColor>{ctxBar(ctx, barW)}</Text>}
            <Text dimColor>
              {' '}
              ctx {ctx}% · {fmtTokens(a.contextTokens)} {fmtTime(elapsed(a, at))}
            </Text>
          </Text>
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
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

